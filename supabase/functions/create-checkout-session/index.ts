import { stripe, admin, userClient } from "../_shared/clients.ts";
import { json, handleOptions } from "../_shared/cors.ts";

const SITE_URL = Deno.env.get("SITE_URL")!;
// Server-side allowlisted price — a price id is NEVER accepted from the request body.
const PRICE_ID = Deno.env.get("STRIPE_MONTHLY_PRICE_ID")!;

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") return json(req, 405, { error: "method not allowed" });

  const { data: { user } } = await userClient(req).auth.getUser();
  if (!user) return json(req, 401, { error: "unauthorized" });

  const body = await req.json().catch(() => ({}));
  const nonce =
    typeof body.nonce === "string" && body.nonce.length > 0 && body.nonce.length <= 64
      ? body.nonce
      : crypto.randomUUID();

  try {
    // 1. Resolve or create the Stripe customer. The identity link is the
    //    Supabase user id (via billing_customers + metadata), never email.
    const { data: bc } = await admin
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let stripeCustomerId = bc?.stripe_customer_id as string | undefined;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      stripeCustomerId = customer.id;
      const { error: insertErr } = await admin
        .from("billing_customers")
        .upsert({ user_id: user.id, stripe_customer_id: stripeCustomerId });
      if (insertErr) throw insertErr;
    }

    // 2. Block a duplicate subscription. trialing/active/past_due covers:
    //    already trialing, already paying, and payment currently failing
    //    but not yet canceled (cancel_at_period_end=true stays 'active'
    //    until the period genuinely ends, so it's covered by 'active' too).
    const { data: blocking } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["trialing", "active", "past_due"])
      .limit(1);
    if (blocking && blocking.length > 0) {
      return json(req, 409, { error: "You already have a subscription in progress." });
    }

    // 3. Trial eligibility: normal 7-day trial if never used; otherwise
    //    only a special-access grant of extra trial days can start a new
    //    trial. Neither -> straight to a normal paid subscription.
    const { data: trialHist } = await admin
      .from("trial_history")
      .select("normal_trial_used")
      .eq("user_id", user.id)
      .maybeSingle();

    let trialDays = 0;
    let specialAccessId: string | null = null;

    if (!trialHist?.normal_trial_used) {
      trialDays = 7;
    } else {
      const { data: grant } = await admin
        .from("special_access")
        .select("id, granted_extra_trial_days")
        .eq("user_id", user.id)
        .eq("extra_trial_days_consumed", false)
        .gt("granted_extra_trial_days", 0)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (grant) {
        trialDays = grant.granted_extra_trial_days as number;
        specialAccessId = grant.id as string;
      }
    }

    // 4. Create the Checkout Session.
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [{ price: PRICE_ID, quantity: 1 }],
        // Stripe's default is 'if_required', which SKIPS card collection
        // when $0 is due today (i.e. during a trial). 'always' forces the
        // card form to appear anyway, which is required so the card can
        // be auto-charged when the trial ends.
        payment_method_collection: "always",
        subscription_data: {
          metadata: {
            supabase_user_id: user.id,
            special_access_id: specialAccessId ?? "",
          },
          ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
        },
        success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/checkout/cancel`,
      },
      { idempotencyKey: `checkout_${user.id}_${nonce}` }
    );

    return json(req, 200, { url: session.url, trialDays });
  } catch (err) {
    console.error("[create-checkout-session] error", err instanceof Error ? err.message : err);
    return json(req, 500, { error: "Could not start checkout. Please try again." });
  }
});
