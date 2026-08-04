import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import { startCheckout, openBillingPortal } from '../../services/subscriptionService';
import AccessCodeRedeemForm from './AccessCodeRedeemForm';
import './BillingPanel.css';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BillingPanel() {
  const {
    loading,
    hasEditingAccess,
    isTrialing,
    isActive,
    isPastDue,
    cancelAtPeriodEnd,
    trialEndsAt,
    accessEndsAt,
    complimentaryAccessUntil,
    canStartTrial,
    refresh,
  } = useSubscription();

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const autoStartedRef = useRef(false);

  // If the landing page or login flow sent the user here with the intent
  // to start a trial, kick off checkout automatically once — but only
  // once, and only if they're actually still eligible.
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (loading) return;
    if (searchParams.get('intent') !== 'trial') return;

    autoStartedRef.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete('intent');
    setSearchParams(next, { replace: true });

    if (canStartTrial && !hasEditingAccess) {
      handleCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, canStartTrial, hasEditingAccess]);

  async function handleCheckout() {
    if (busy) return;
    setBusy(true);
    setActionError('');
    try {
      const { url } = await startCheckout(crypto.randomUUID());
      window.location.href = url;
    } catch (err) {
      setBusy(false);
      setActionError(err.message || 'Could not start checkout. Please try again.');
    }
  }

  async function handleManageBilling() {
    if (busy) return;
    setBusy(true);
    setActionError('');
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch (err) {
      setBusy(false);
      setActionError(err.message || 'Could not open the billing portal. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="bp-panel">
        <div className="bp-card">
          <p className="bp-desc">Loading your plan…</p>
        </div>
      </div>
    );
  }

  let statusLine;
  if (isPastDue) {
    statusLine = "There's a problem with your last payment. Update your card to keep editing.";
  } else if (isTrialing) {
    statusLine = `Free trial — ends ${formatDate(trialEndsAt)}`;
  } else if (isActive) {
    statusLine = cancelAtPeriodEnd
      ? `Active — cancels on ${formatDate(accessEndsAt)}`
      : `Active — renews ${formatDate(accessEndsAt)}`;
  } else if (complimentaryAccessUntil) {
    statusLine = `Complimentary access until ${formatDate(complimentaryAccessUntil)}`;
  } else {
    statusLine = 'No active subscription';
  }

  let ctaLabel;
  let ctaAction;
  if (isPastDue || hasEditingAccess) {
    ctaLabel = isPastDue ? 'Update payment method' : 'Manage subscription';
    ctaAction = handleManageBilling;
  } else if (canStartTrial) {
    ctaLabel = 'Start 7-day free trial';
    ctaAction = handleCheckout;
  } else {
    ctaLabel = 'Subscribe — AUD $8/month, billed immediately';
    ctaAction = handleCheckout;
  }

  return (
    <div className="bp-panel">
      <div className="bp-card">
        <h3 className="bp-title">Plan &amp; billing</h3>
        <p className="bp-desc">Workfolio — AUD $8/month after your 7-day free trial.</p>

        <span className="bp-plan-badge">{statusLine}</span>

        {actionError && <p className="bp-error">{actionError}</p>}

        <button className="bp-btn-primary" onClick={ctaAction} disabled={busy}>
          {busy ? 'Loading…' : ctaLabel}
        </button>
      </div>

      <AccessCodeRedeemForm onRedeemed={refresh} />
    </div>
  );
}
