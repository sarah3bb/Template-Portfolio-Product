-- ============================================================
-- Billing customers, subscriptions, trial history
-- Run via `supabase db push` (see PAYMENTS_SETUP.md)
-- ============================================================

-- Links a Supabase user to a Stripe Customer. The identity link is always
-- the Supabase user id (via this table), never the customer's email.
create table public.billing_customers (
  user_id uuid primary key references auth.users on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;

create policy "billing_customers_select_own" on public.billing_customers
  for select using (auth.uid() = user_id);
-- No insert/update/delete policies for anon/authenticated: only the
-- service role (used exclusively inside Edge Functions) may write here.

-- One row per distinct Stripe subscription id. A cancel-then-resubscribe
-- creates a new Stripe subscription id, so history is preserved as
-- separate rows rather than being overwritten in place.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  status text not null check (status in (
    'trialing', 'active', 'past_due', 'unpaid',
    'incomplete', 'incomplete_expired', 'paused', 'canceled'
  )),
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  ended_at timestamptz,
  -- Guards against an out-of-order webhook delivery regressing state;
  -- see upsert_subscription_event() in the entitlement migration.
  last_synced_event_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_user_status_idx on public.subscriptions (user_id, status);
create index subscriptions_customer_idx on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
-- No client writes — only the Stripe webhook (service role) writes here.

-- Tracks only whether a user has EVER consumed the standard 7-day trial,
-- by any mechanism. One row per user.
create table public.trial_history (
  user_id uuid primary key references auth.users on delete cascade,
  normal_trial_used boolean not null default false,
  first_trial_started_at timestamptz,
  first_trial_ended_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.trial_history enable row level security;

create policy "trial_history_select_own" on public.trial_history
  for select using (auth.uid() = user_id);
-- No client writes.
