-- ============================================================
-- Private family-and-friends access codes
--
-- These tables have ZERO row-level-security policies for anon/authenticated
-- roles — not even own-row select. Only the service role (used exclusively
-- inside the redeem-access-code Edge Function) can read or write them.
-- This is what keeps the codes, their config, and the validation logic
-- entirely out of reach of the browser/frontend bundle.
--
-- HOW TO SAFELY CREATE A CODE (run in the Supabase SQL Editor):
--
--   select encode(
--     digest('the-plaintext-code' || '<ACCESS_CODE_PEPPER secret value>', 'sha256'),
--     'hex'
--   );
--
-- then:
--
--   insert into access_codes
--     (code_hash, description, max_redemptions, extra_trial_days, complimentary_access_until)
--   values
--     ('<hash from above>', 'Mom - complimentary access', 1, null, '2027-01-01T00:00:00Z');
--
-- Never type the plaintext code into application code, logs, or version
-- control — only into this one-off SQL statement in the dashboard.
-- ============================================================

create table public.access_codes (
  id uuid primary key default gen_random_uuid(),
  -- sha256(ACCESS_CODE_PEPPER || plaintext code), hex-encoded. The pepper is
  -- a Supabase secret, never stored in the database, so a database dump
  -- alone cannot be used to brute-force or rainbow-table the codes.
  code_hash text unique not null,
  description text,
  active boolean not null default true,
  max_redemptions int not null default 1 check (max_redemptions > 0),
  redemption_count int not null default 0 check (
    redemption_count >= 0 and redemption_count <= max_redemptions
  ),
  expires_at timestamptz,
  extra_trial_days int check (extra_trial_days >= 0),
  complimentary_access_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.access_codes enable row level security;
-- Intentionally zero policies. RLS with no policies means every row is
-- filtered out for anon/authenticated — the service role bypasses RLS
-- entirely, which is the only way this table is ever read or written.

-- Every redemption attempt is logged, including guesses that match no
-- code at all (access_code_id = null) and duplicate/failed attempts —
-- this doubles as the audit trail and the per-user rate-limit source.
create table public.access_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  access_code_id uuid references public.access_codes on delete set null,
  user_id uuid not null references auth.users on delete cascade,
  redeemed_at timestamptz not null default now(),
  result text not null check (result in (
    'success', 'invalid', 'inactive', 'expired', 'exhausted', 'already_redeemed'
  ))
);

-- A user may accumulate many failed/duplicate attempt rows (needed for
-- rate-limiting and audit), but at most one SUCCESS per user per code.
create unique index access_code_redemptions_success_unique
  on public.access_code_redemptions (access_code_id, user_id)
  where result = 'success';

create index access_code_redemptions_user_idx on public.access_code_redemptions (user_id);
create index access_code_redemptions_code_idx on public.access_code_redemptions (access_code_id);

alter table public.access_code_redemptions enable row level security;

create policy "access_code_redemptions_select_own" on public.access_code_redemptions
  for select using (auth.uid() = user_id);
-- No client writes — only via redeem_access_code() (service role only).

-- What a redemption actually granted, frozen/denormalized at redemption
-- time. Later edits to access_codes never retroactively change a grant
-- that's already been redeemed.
create table public.special_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  access_code_id uuid not null references public.access_codes on delete cascade,
  granted_extra_trial_days int not null default 0,
  extra_trial_days_consumed boolean not null default false,
  granted_complimentary_until timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, access_code_id)
);

create index special_access_user_idx on public.special_access (user_id);

alter table public.special_access enable row level security;

create policy "special_access_select_own" on public.special_access
  for select using (auth.uid() = user_id);
-- No client writes.

-- Webhook idempotency bookkeeping. Purely internal — fully locked, not
-- even own-row select.
create table public.processed_stripe_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.processed_stripe_events enable row level security;
-- Zero policies.
