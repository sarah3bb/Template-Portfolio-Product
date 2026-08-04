-- ============================================================
-- Entitlement function — single source of truth for editing access
-- ============================================================

-- Only "trialing" or "active" subscriptions grant editing access, and only
-- unexpired complimentary access. Deliberately does NOT include "past_due" —
-- that status is read-only per the access matrix, even though past_due still
-- blocks a *new* checkout (a separate check inside create-checkout-session).
--
-- SECURITY DEFINER but hard-bound to auth.uid(): even though this must be
-- grantable to `authenticated` (RLS policies run as the calling user and
-- need EXECUTE), a caller can never learn a stranger's entitlement by
-- calling rpc('can_edit_portfolio', {p_user_id: '<someone else>'}) because
-- the function always returns false unless p_user_id = auth.uid().
create or replace function public.can_edit_portfolio(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (p_user_id = auth.uid()) and (
    exists (
      select 1 from public.subscriptions s
      where s.user_id = p_user_id and s.status in ('trialing', 'active')
    )
    or exists (
      select 1 from public.special_access sa
      where sa.user_id = p_user_id
        and sa.granted_complimentary_until is not null
        and sa.granted_complimentary_until > now()
    )
  );
$$;

grant execute on function public.can_edit_portfolio(uuid) to authenticated;

-- ============================================================
-- Portfolios: writes additionally require an editing entitlement.
-- Select policies are untouched — read access (dashboard, account,
-- billing, public /p/:slug) is never gated by subscription status.
-- ============================================================

drop policy if exists "portfolios_insert_own" on public.portfolios;
create policy "portfolios_insert_own" on public.portfolios
  for insert with check (auth.uid() = user_id and public.can_edit_portfolio(auth.uid()));

drop policy if exists "portfolios_update_own" on public.portfolios;
create policy "portfolios_update_own" on public.portfolios
  for update using (auth.uid() = user_id and public.can_edit_portfolio(auth.uid()));

drop policy if exists "portfolios_delete_own" on public.portfolios;
create policy "portfolios_delete_own" on public.portfolios
  for delete using (auth.uid() = user_id and public.can_edit_portfolio(auth.uid()));

-- ============================================================
-- Storage (portfolio-assets): same entitlement gate on writes.
-- storage_select_own / storage_public_read are untouched — viewing
-- existing images always works, even without editing access.
-- ============================================================

drop policy if exists "storage_insert_own" on storage.objects;
create policy "storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'portfolio-assets'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
    and public.can_edit_portfolio(auth.uid())
  );

drop policy if exists "storage_update_own" on storage.objects;
create policy "storage_update_own" on storage.objects
  for update using (
    bucket_id = 'portfolio-assets'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
    and public.can_edit_portfolio(auth.uid())
  );

drop policy if exists "storage_delete_own" on storage.objects;
create policy "storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'portfolio-assets'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
    and public.can_edit_portfolio(auth.uid())
  );

-- ============================================================
-- Access code redemption — atomic, service-role only
-- ============================================================

create or replace function public.redeem_access_code(p_code_hash text, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.access_codes;
  v_updated public.access_codes;
begin
  select * into v_code from public.access_codes where code_hash = p_code_hash;

  if not found then
    insert into public.access_code_redemptions (access_code_id, user_id, result)
    values (null, p_user_id, 'invalid');
    return jsonb_build_object('success', false);
  end if;

  if not v_code.active then
    insert into public.access_code_redemptions (access_code_id, user_id, result)
    values (v_code.id, p_user_id, 'inactive');
    return jsonb_build_object('success', false);
  end if;

  if v_code.expires_at is not null and v_code.expires_at <= now() then
    insert into public.access_code_redemptions (access_code_id, user_id, result)
    values (v_code.id, p_user_id, 'expired');
    return jsonb_build_object('success', false);
  end if;

  if exists (
    select 1 from public.access_code_redemptions
    where access_code_id = v_code.id and user_id = p_user_id and result = 'success'
  ) then
    insert into public.access_code_redemptions (access_code_id, user_id, result)
    values (v_code.id, p_user_id, 'already_redeemed');
    return jsonb_build_object('success', false);
  end if;

  -- ATOMIC GUARD: Postgres takes a row-level lock on the matched access_codes
  -- row for the duration of this UPDATE. A concurrent redeem_access_code()
  -- call targeting the SAME row blocks until this transaction commits or
  -- rolls back, then re-evaluates this WHERE clause against the just-
  -- committed values. That is what makes it impossible for two concurrent
  -- redemptions of a max_redemptions=1 code to both succeed: the second
  -- one's WHERE clause sees redemption_count already incremented and the
  -- UPDATE matches zero rows.
  update public.access_codes
  set redemption_count = redemption_count + 1,
      updated_at = now()
  where id = v_code.id
    and active
    and redemption_count < max_redemptions
    and (expires_at is null or expires_at > now())
  returning * into v_updated;

  if not found then
    -- Lost the race, or the code became invalid/exhausted between the
    -- lookup above and this UPDATE. The pre-checks above are best-effort
    -- for nicer log labels in the common case; this branch is the true
    -- source of correctness.
    insert into public.access_code_redemptions (access_code_id, user_id, result)
    values (v_code.id, p_user_id, 'exhausted');
    return jsonb_build_object('success', false);
  end if;

  begin
    insert into public.access_code_redemptions (access_code_id, user_id, result)
    values (v_code.id, p_user_id, 'success');

    insert into public.special_access (
      user_id, access_code_id, granted_extra_trial_days,
      extra_trial_days_consumed, granted_complimentary_until
    ) values (
      p_user_id, v_code.id, coalesce(v_updated.extra_trial_days, 0),
      false, v_updated.complimentary_access_until
    )
    on conflict (user_id, access_code_id) do nothing;
  exception when unique_violation then
    -- Hardening: a same-user rapid-double-click race against a MULTI-
    -- redemption code (max_redemptions > 1) can pass the atomic UPDATE
    -- above twice, but the partial unique index on
    -- access_code_redemptions only allows one 'success' row per
    -- (access_code_id, user_id). The loser lands here instead of
    -- raising a raw constraint-violation error to the caller.
    return jsonb_build_object('success', false);
  end;

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.redeem_access_code(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_access_code(text, uuid) to service_role;

-- ============================================================
-- Subscription upsert with out-of-order-event protection.
--
-- Stripe does not guarantee webhook delivery order. Trusting whichever
-- event *arrives* last can regress state (e.g. a stale "active" delivered
-- late overwriting a newer "canceled"). The WHERE clause on the
-- ON CONFLICT ... DO UPDATE makes "only apply if this event is not
-- older than what's already stored" atomic at the database level — no
-- read-then-write race window.
-- ============================================================

create or replace function public.upsert_subscription_event(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_status text,
  p_cancel_at_period_end boolean,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_trial_start timestamptz,
  p_trial_end timestamptz,
  p_ended_at timestamptz,
  p_event_created timestamptz
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.subscriptions (
    user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, status,
    cancel_at_period_end, current_period_start, current_period_end,
    trial_start, trial_end, ended_at, last_synced_event_created_at, updated_at
  ) values (
    p_user_id, p_stripe_customer_id, p_stripe_subscription_id, p_stripe_price_id, p_status,
    p_cancel_at_period_end, p_current_period_start, p_current_period_end,
    p_trial_start, p_trial_end, p_ended_at, p_event_created, now()
  )
  on conflict (stripe_subscription_id) do update set
    stripe_price_id = excluded.stripe_price_id,
    status = excluded.status,
    cancel_at_period_end = excluded.cancel_at_period_end,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    trial_start = excluded.trial_start,
    trial_end = excluded.trial_end,
    ended_at = excluded.ended_at,
    last_synced_event_created_at = excluded.last_synced_event_created_at,
    updated_at = now()
  where public.subscriptions.last_synced_event_created_at is null
     or public.subscriptions.last_synced_event_created_at <= excluded.last_synced_event_created_at;
$$;

revoke all on function public.upsert_subscription_event from public, anon, authenticated;
grant execute on function public.upsert_subscription_event to service_role;

-- ============================================================
-- Trial-history flag flips (idempotent, "set once" semantics)
-- ============================================================

create or replace function public.mark_trial_started(p_user_id uuid, p_started_at timestamptz)
returns void language sql security definer set search_path = public as $$
  insert into public.trial_history (user_id, normal_trial_used, first_trial_started_at)
  values (p_user_id, true, p_started_at)
  on conflict (user_id) do update set
    normal_trial_used = true,
    first_trial_started_at = coalesce(public.trial_history.first_trial_started_at, excluded.first_trial_started_at),
    updated_at = now();
$$;

create or replace function public.mark_trial_ended(p_user_id uuid, p_ended_at timestamptz)
returns void language sql security definer set search_path = public as $$
  update public.trial_history
  set first_trial_ended_at = coalesce(first_trial_ended_at, p_ended_at), updated_at = now()
  where user_id = p_user_id;
$$;

revoke all on function public.mark_trial_started from public, anon, authenticated;
revoke all on function public.mark_trial_ended from public, anon, authenticated;
grant execute on function public.mark_trial_started to service_role;
grant execute on function public.mark_trial_ended to service_role;
