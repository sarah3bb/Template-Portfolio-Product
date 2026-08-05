# Payments Setup — Stripe Subscriptions

This document covers the Stripe subscription system: architecture, deployment,
local testing, and administration. It assumes you already have a working
Supabase project (see the main README for the base app setup).

## Architecture

- **Frontend** (React/Vite, deployed on Vercel) never talks to Stripe
  directly. It calls four Supabase Edge Functions, all of which resolve the
  calling user from their Supabase JWT — never from anything the browser
  supplies about itself.
- **Edge Functions** (`supabase/functions/`, Deno + TypeScript):
  - `create-checkout-session` — starts a Stripe Checkout session (7-day
    trial if eligible, server-side allowlisted price).
  - `stripe-webhook` — the only thing Stripe talks to. Verifies the
    `Stripe-Signature` header and is the single source of truth for
    subscription state.
  - `create-customer-portal-session` — opens Stripe's hosted billing
    portal for the caller's own subscription.
  - `redeem-access-code` — redeems a family/friend access code.
- **Database** (`supabase/migrations/`): `billing_customers`,
  `subscriptions`, `trial_history`, `access_codes`,
  `access_code_redemptions`, `special_access`, `processed_stripe_events`,
  plus a `can_edit_portfolio(uuid)` function used directly inside the RLS
  policies on `portfolios` and `storage.objects`. **Postgres RLS is the
  real enforcement** — the frontend only mirrors it for UX (disabled
  buttons, banners); a user who bypasses the UI still can't write through
  a denied policy.

## Environment variables & secrets

Frontend (`.env`, `VITE_*`, unchanged by this feature — no new browser-exposed
variables were needed since checkout is a plain redirect to a Stripe-hosted
URL, never Stripe.js/Elements):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
```

Supabase Edge Function secrets (server-side only, set via `supabase secrets
set` — never commit these, never prefix with `VITE_`):

| Secret | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API secret key (test or live) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the webhook endpoint |
| `STRIPE_MONTHLY_PRICE_ID` | The one allowlisted price — `price_1U0WtM4vhnu5f9MdQR1Easwo` in test mode |
| `SITE_URL` | Your deployed frontend origin (e.g. `https://your-app.vercel.app`), used to build Checkout/Portal return URLs and CORS |
| `ACCESS_CODE_PEPPER` | Random secret string mixed into access-code hashes |

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
automatically provided to every Edge Function by Supabase — do not set
them yourself.

## Stripe dashboard setup

1. **Product & price** — already created for you: product "My Profyle -
   Easiest Portfolio Builder", monthly price `price_1U0WtM4vhnu5f9MdQR1Easwo`
   (AUD $8/month, test mode). Confirm it in Stripe Dashboard → Product
   catalog.
2. **Webhook endpoint** — Developers → Webhooks → Add endpoint:
   - URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `invoice.paid`, `invoice.payment_failed`,
     `invoice.payment_action_required`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. **Customer Portal** — Settings → Billing → Customer portal: enable
   "Cancel subscriptions" with "at end of billing period" (not
   immediately), and enable "Update payment method". Save.

## Deployment commands

```bash
# 1. Install the Supabase CLI (if not already installed)
npm install -g supabase

# 2. Log in
supabase login

# 3. Link this repo to your Supabase project
supabase link --project-ref <your-project-ref>

# 4. Apply the migrations
supabase db push

# 5. Set the Edge Function secrets
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  STRIPE_MONTHLY_PRICE_ID=price_1U0WtM4vhnu5f9MdQR1Easwo \
  SITE_URL=https://your-app.vercel.app \
  ACCESS_CODE_PEPPER="$(openssl rand -hex 32)"

# 6. Deploy the JWT-verified functions
supabase functions deploy create-checkout-session
supabase functions deploy create-customer-portal-session
supabase functions deploy redeem-access-code

# 7. Deploy the webhook WITHOUT JWT verification (Stripe can't present a Supabase JWT)
supabase functions deploy stripe-webhook --no-verify-jwt
```

(`supabase/config.toml` also declares `verify_jwt = false` for
`stripe-webhook` so `supabase db push`/redeploys stay consistent with this.)

## Local testing

```bash
# Terminal 1 — serve functions locally
supabase functions serve --env-file supabase/.env.local

# Terminal 2 — forward Stripe webhook events to your local function
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Terminal 3 — trigger test events without a real browser checkout
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

Create `supabase/.env.local` (gitignored) with the same secrets as step 5
above, plus `SITE_URL=http://localhost:5173` for local frontend testing.

### Test cards

| Card | Behavior |
|---|---|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 0341` | Fails on confirmation (simulates a bad card) |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

Use [Stripe test clocks](https://stripe.com/docs/billing/testing/test-clocks)
to fast-forward a trial to its end date without waiting 7 real days.

## Trial behavior

- Every user gets exactly one normal 7-day trial, tracked in
  `trial_history.normal_trial_used` — set the first time a subscription for
  that user is observed in `trialing` status (via the webhook, not at
  checkout-session-creation time, since a session can be abandoned).
- A card is always collected up front (`payment_method_collection: 'always'`
  on the Checkout Session) — Stripe's default would otherwise skip card
  collection entirely when $0 is due today.
- Once `normal_trial_used` is true, a new checkout only gets another trial
  if the user has an unconsumed `special_access.granted_extra_trial_days`
  grant from a redeemed access code; otherwise checkout charges
  immediately with no trial (the Edge Function response includes
  `trialDays: 0` so the frontend can say so explicitly before redirecting).

## Cancellation behavior

- Cancellation happens through the Stripe Customer Portal
  (`create-customer-portal-session`), configured to cancel **at the end of
  the current billing period** by default — the user keeps full editing
  access until `current_period_end`.
- If a *trial* is cancelled and Stripe ends it immediately (rather than at
  a period end, since there's no paid period to run out), the webhook's
  `customer.subscription.updated`/`.deleted` event reflects that
  immediately and access is revoked as soon as status leaves
  `trialing`/`active` — access is always driven by the actual Stripe
  status, never by the frontend's own guess.

## Special access-code administration

Codes are created directly via SQL — there is no admin UI, by design (they're
never exposed to any client, not even an authenticated one). In the Supabase
SQL Editor:

```sql
-- 1. Compute the hash (uses the same ACCESS_CODE_PEPPER secret you set above)
select encode(digest('mom2026' || '<ACCESS_CODE_PEPPER value>', 'sha256'), 'hex');

-- 2. Insert the code using that hash — never the plaintext
insert into access_codes
  (code_hash, description, max_redemptions, extra_trial_days, complimentary_access_until)
values
  ('<hash from step 1>', 'Mom - complimentary access', 1, null, '2027-01-01T00:00:00Z');
```

Set `extra_trial_days` for a code that grants another Stripe trial (even to
a user who's already used their normal one). Set
`complimentary_access_until` for pure free access with no Stripe
subscription at all. A code can set either, both, or neither field.

To deactivate a code without deleting its redemption history:
`update access_codes set active = false where id = '<id>';`

## Production launch checklist

- [ ] Create a **live-mode** product/price in Stripe, replace
      `STRIPE_MONTHLY_PRICE_ID` with the live price id.
- [ ] Replace `STRIPE_SECRET_KEY` with the live secret key.
- [ ] Register a **separate live-mode webhook endpoint** (test and live
      webhooks are entirely separate in Stripe) and update
      `STRIPE_WEBHOOK_SECRET`.
- [ ] Set `SITE_URL` to the real production domain.
- [ ] Re-run the full test checklist below against live mode with a real
      card in a small amount, then refund it.
- [ ] Confirm the Customer Portal's live-mode configuration matches test
      mode (cancel-at-period-end, update payment method).

## Test-mode vs live-mode Stripe IDs

Stripe test mode and live mode are entirely separate: separate API keys
(`sk_test_...` vs `sk_live_...`), separate products/prices/customers/
subscriptions, and separate webhook endpoints with separate signing
secrets. Nothing carries over automatically — going live means repeating
the "Stripe dashboard setup" steps above in live mode and swapping all
four `STRIPE_*`-related secrets.

## Rotating a compromised key

1. In the Stripe Dashboard, roll the compromised key (Developers → API
   keys → roll key) — this immediately invalidates the old one.
2. `supabase secrets set STRIPE_SECRET_KEY=sk_...<new>`
3. Redeploy any function that uses it (secrets are picked up on next cold
   start, but redeploying guarantees it): `supabase functions deploy
   create-checkout-session create-customer-portal-session redeem-access-code
   stripe-webhook`
4. If the webhook signing secret was compromised, roll it from the
   webhook's settings page in Stripe, then update
   `STRIPE_WEBHOOK_SECRET` the same way.
5. If `ACCESS_CODE_PEPPER` was compromised, rotate it — but note this
   invalidates every existing code's hash (they'd need to be
   re-inserted with hashes computed against the new pepper).

## Inspecting webhook failures

- **Stripe Dashboard** → Developers → Webhooks → your endpoint → shows
  every delivery attempt, response status, and response body.
- **Supabase** → Edge Functions → `stripe-webhook` → Logs — the function
  logs the event type and any handler error (`[stripe-webhook] handler
  error for ...`) without leaking secrets or full payment payloads.
- A failed delivery is automatically retried by Stripe; the handler is
  written to be safe to retry (see the "critical fix" note in the
  function itself — a failed handler run deletes its own
  `processed_stripe_events` claim row so the retry actually reprocesses
  instead of being silently treated as a duplicate).

## Manually reconciling a subscription

If a webhook was permanently missed (e.g. the endpoint was misconfigured
for a period), reconcile by hand:

1. Find the subscription in the Stripe Dashboard and note its id, status,
   and period dates.
2. In the Supabase SQL Editor, call the same function the webhook uses:

```sql
select upsert_subscription_event(
  p_user_id => '<supabase user id, from billing_customers or subscriptions.metadata>',
  p_stripe_customer_id => 'cus_...',
  p_stripe_subscription_id => 'sub_...',
  p_stripe_price_id => 'price_...',
  p_status => 'active',
  p_cancel_at_period_end => false,
  p_current_period_start => '2026-08-01T00:00:00Z',
  p_current_period_end => '2026-09-01T00:00:00Z',
  p_trial_start => null,
  p_trial_end => null,
  p_ended_at => null,
  p_event_created => now()
);
```

Using `now()` (or a timestamp later than anything already stored) for
`p_event_created` ensures the out-of-order-protection in
`upsert_subscription_event` doesn't reject the manual fix.

## Testing checklist

1. New user starts a 7-day trial — card is collected, subscription becomes `trialing`, editing unlocks.
2. Starting a second checkout while `trialing` is rejected (409).
3. Cancel during trial via the Customer Portal — access follows the resulting Stripe status.
4. Cancel an active (paid) subscription — access remains through `current_period_end`, then locks.
5. Public portfolio (`/p/:slug`) stays visible and unaffected regardless of subscription state.
6. Trial-expired/former-subscriber user restarts without getting a second normal trial (no `trial_period_days` sent).
7. Failed payment (`4000 0000 0000 0341`) — status moves appropriately, access locks.
8. Payment recovery — a later successful invoice restores `active` status and access.
9. Webhook retry — resending the same event from the Stripe Dashboard is a no-op the second time (`processed_stripe_events`).
10. Duplicate webhook delivery — same outcome as #9.
11. Tampered price id — a request can't be crafted to pass a different price; the Edge Function never reads one from the client.
12. Unauthenticated checkout request — `401`, no Stripe Customer created.
13. Attempting to edit another user's portfolio — rejected by RLS regardless of client-side code.
14. Valid access code — redeems once, grants the configured extra trial days or complimentary access.
15. Invalid / expired / exhausted / already-redeemed codes — all return the same generic message.
16. Concurrent double-redeem of a one-use (`max_redemptions=1`) code (e.g. two browser tabs) — exactly one succeeds.
17. Vercel return routing — `/checkout/success` and `/checkout/cancel` load correctly after a real Stripe redirect (no GitHub Pages 404 fallback is needed since Vercel's `vercel.json` already rewrites all paths to `index.html`).
18. Supabase project temporarily paused/unavailable — the app's existing `isSupabaseConfigured`/`requireSupabase()` guards degrade gracefully rather than crashing.
