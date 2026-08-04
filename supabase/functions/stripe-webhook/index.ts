import { stripe, admin } from "../_shared/clients.ts";

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  // MUST read the body as raw text BEFORE any parsing — the signature is
  // computed over the exact raw bytes Stripe sent.
  const rawBody = await req.text();

  if (!signature) return new Response("missing signature", { status: 400 });

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err instanceof Error ? err.message : err);
    return new Response("signature verification failed", { status: 400 });
  }

  // Atomic dedup claim: insert-or-ignore. If no row comes back, another
  // delivery of this same event already claimed it — return success
  // immediately without reprocessing (idempotent, safe for Stripe retries).
  const { data: claimed, error: claimErr } = await admin
    .from("processed_stripe_events")
    .upsert(
      { stripe_event_id: event.id, event_type: event.type },
      { onConflict: "stripe_event_id", ignoreDuplicates: true }
    )
    .select();

  if (claimErr) {
    console.error("[stripe-webhook] failed to claim event", claimErr.message);
    return new Response("db error", { status: 500 });
  }
  if (!claimed || claimed.length === 0) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error(`[stripe-webhook] handler error for ${event.type}`, err instanceof Error ? err.message : err);
    // Critical: undo the claim so a retried delivery of this SAME event can
    // actually reprocess it. Without this, a transient failure here would
    // permanently mark the event "processed" while the real work (updating
    // subscriptions/trial_history) never completed — silently swallowing
    // every future retry as a "duplicate".
    await admin.from("processed_stripe_events").delete().eq("stripe_event_id", event.id);
    return new Response("handler error", { status: 500 }); // Stripe will retry
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

// deno-lint-ignore no-explicit-any
async function handleEvent(event: any) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const userId = await resolveUserId(sub);
      if (!userId) {
        console.error(`[stripe-webhook] could not resolve user for subscription ${sub.id}`);
        break;
      }

      const { error: upsertErr } = await admin.rpc("upsert_subscription_event", {
        p_user_id: userId,
        p_stripe_customer_id: sub.customer,
        p_stripe_subscription_id: sub.id,
        p_stripe_price_id: sub.items?.data?.[0]?.price?.id ?? "",
        p_status: sub.status,
        p_cancel_at_period_end: sub.cancel_at_period_end,
        p_current_period_start: toIso(sub.current_period_start),
        p_current_period_end: toIso(sub.current_period_end),
        p_trial_start: toIso(sub.trial_start),
        p_trial_end: toIso(sub.trial_end),
        p_ended_at: toIso(sub.ended_at),
        p_event_created: toIso(event.created),
      });
      if (upsertErr) throw upsertErr;

      if (sub.status === "trialing") {
        const { error: trialErr } = await admin.rpc("mark_trial_started", {
          p_user_id: userId,
          p_started_at: toIso(sub.trial_start ?? event.created),
        });
        if (trialErr) throw trialErr;

        const specialAccessId = sub.metadata?.special_access_id;
        if (specialAccessId) {
          const { error: consumeErr } = await admin
            .from("special_access")
            .update({ extra_trial_days_consumed: true })
            .eq("id", specialAccessId)
            .eq("extra_trial_days_consumed", false);
          if (consumeErr) throw consumeErr;
        }
      } else {
        // Idempotent no-op if this user never had a trial (mark_trial_ended
        // only updates an existing trial_history row).
        const { error: endErr } = await admin.rpc("mark_trial_ended", {
          p_user_id: userId,
          p_ended_at: toIso(event.created),
        });
        if (endErr) throw endErr;
      }
      break;
    }

    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.payment_action_required": {
      // Stripe always fires customer.subscription.updated alongside these
      // with the authoritative status — that's the single write path for
      // subscription state. Logged here only for visibility.
      console.log(`[stripe-webhook] ${event.type} for invoice ${event.data.object.id}`);
      break;
    }

    case "checkout.session.completed": {
      // Deliberately a no-op: long-term subscription state is driven
      // entirely by customer.subscription.* events, never by this event
      // alone (checkout.session.completed can fire before the subscription
      // object is fully settled, and provides no more info than those do).
      break;
    }

    default:
      break;
  }
}

// deno-lint-ignore no-explicit-any
async function resolveUserId(sub: any): Promise<string | null> {
  if (sub.metadata?.supabase_user_id) return sub.metadata.supabase_user_id;
  const { data } = await admin
    .from("billing_customers")
    .select("user_id")
    .eq("stripe_customer_id", sub.customer)
    .maybeSingle();
  return data?.user_id ?? null;
}

function toIso(unixSeconds: number | null | undefined): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}
