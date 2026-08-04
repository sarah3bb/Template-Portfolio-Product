import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSubscription, getTrialHistory, getSpecialAccessRows } from '../services/subscriptionService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const SubscriptionContext = createContext(null);

const EDITING_STATUSES = ['trialing', 'active'];
const BLOCKING_STATUSES = ['trialing', 'active', 'past_due'];

function deriveStatus(subscription, trialHistory, specialAccessRows) {
  const status = subscription?.status ?? 'none';
  const isTrialing = status === 'trialing';
  const isActive = status === 'active';
  const isPastDue = status === 'past_due';
  const cancelAtPeriodEnd = !!subscription?.cancel_at_period_end;

  const complimentaryAccessUntil = specialAccessRows
    .map((row) => row.granted_complimentary_until)
    .filter((until) => until && new Date(until) > new Date())
    .sort((a, b) => new Date(a) - new Date(b))[0] || null;

  const hasComplimentaryAccess = !!complimentaryAccessUntil;
  // Client-side mirror of the can_edit_portfolio() DB function, for UX only —
  // Postgres RLS is the real, authoritative enforcement.
  const hasEditingAccess = EDITING_STATUSES.includes(status) || hasComplimentaryAccess;

  const normalTrialUsed = !!trialHistory?.normal_trial_used;
  const canStartTrial = !normalTrialUsed && !BLOCKING_STATUSES.includes(status);
  const canRestartSubscription = normalTrialUsed && !hasEditingAccess && subscription !== null;

  return {
    status,
    isTrialing,
    isActive,
    isPastDue,
    cancelAtPeriodEnd,
    trialEndsAt: subscription?.trial_end || null,
    accessEndsAt: subscription?.current_period_end || null,
    // Alias of accessEndsAt — same value, kept under both names since UI
    // code refers to it as "current period end" specifically for active
    // (non-trial) subscriptions.
    currentPeriodEnd: subscription?.current_period_end || null,
    complimentaryAccessUntil,
    hasEditingAccess,
    normalTrialUsed,
    canStartTrial,
    canRestartSubscription,
  };
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [trialHistory, setTrialHistory] = useState(null);
  const [specialAccessRows, setSpecialAccessRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setSubscription(null);
      setTrialHistory(null);
      setSpecialAccessRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [sub, hist, sa] = await Promise.all([
        getSubscription(user.id),
        getTrialHistory(user.id),
        getSpecialAccessRows(user.id),
      ]);
      setSubscription(sub);
      setTrialHistory(hist);
      setSpecialAccessRows(sa);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // Depend on the user id, not the user object — see usePortfolio.js for
    // why (Supabase emits a new user object on every token refresh).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const value = {
    loading,
    error,
    ...deriveStatus(subscription, trialHistory, specialAccessRows),
    refresh: load,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside <SubscriptionProvider>');
  return ctx;
}
