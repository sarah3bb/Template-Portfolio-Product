import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import { startCheckout, openBillingPortal } from '../../services/subscriptionService';
import AccessCodeRedeemForm from './AccessCodeRedeemForm';
import './BillingPanel.css';

const PRICE_LABEL = '$8 AUD';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// tone: 'success' | 'warn' | 'neutral' — drives the panel's color treatment.
function StatusPanel({ tone, badge, heading, children }) {
  return (
    <div className={`bp-status-panel bp-status-${tone}`}>
      {tone !== 'neutral' && (
        <div className={`bp-status-icon bp-status-icon-${tone}`} aria-hidden="true">
          {tone === 'success' ? '✓' : '!'}
        </div>
      )}
      <div className="bp-status-body">
        <span className={`bp-badge bp-badge-${tone}`}>{badge}</span>
        <h3 className="bp-status-heading">{heading}</h3>
        {children}
      </div>
    </div>
  );
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
    currentPeriodEnd,
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

  // Short refresh burst on mount — covers landing here straight from a
  // Stripe Checkout/Portal redirect (a full page load, so this component
  // mounts fresh) where the webhook may not have finished writing the new
  // status yet. Purely a UI freshness nudge; RLS/webhook logic is untouched.
  useEffect(() => {
    const timers = [1500, 3500, 6000].map(delay => setTimeout(refresh, delay));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  let panel;

  if (isPastDue) {
    panel = (
      <StatusPanel tone="warn" badge="Payment issue" heading="There's a problem with your payment">
        <p className="bp-status-text">Update your card to keep editing your portfolio.</p>
      </StatusPanel>
    );
  } else if (isTrialing && !cancelAtPeriodEnd) {
    panel = (
      <StatusPanel tone="success" badge="Active trial" heading="You're subscribed">
        <p className="bp-status-subheading">Your 7-day free trial is active</p>
        <p className="bp-status-text">
          You will be charged {PRICE_LABEL}/month on {formatDate(trialEndsAt)}.
        </p>
      </StatusPanel>
    );
  } else if (isTrialing && cancelAtPeriodEnd) {
    panel = (
      <StatusPanel tone="warn" badge={`Cancelled — access ends ${formatDate(trialEndsAt)}`} heading="Your subscription is cancelled">
        <p className="bp-status-text">You still have full access until {formatDate(trialEndsAt)}.</p>
        <p className="bp-status-text">Your subscription will end after your trial on {formatDate(trialEndsAt)}.</p>
      </StatusPanel>
    );
  } else if (isActive && !cancelAtPeriodEnd) {
    panel = (
      <StatusPanel tone="success" badge="Active subscription" heading="You're subscribed">
        <p className="bp-status-text">Your Workfolio subscription is active.</p>
        <p className="bp-status-text">Next payment: {PRICE_LABEL} on {formatDate(currentPeriodEnd)}.</p>
      </StatusPanel>
    );
  } else if (isActive && cancelAtPeriodEnd) {
    panel = (
      <StatusPanel tone="warn" badge={`Cancelled — access ends ${formatDate(currentPeriodEnd)}`} heading="Your subscription is cancelled">
        <p className="bp-status-text">You remain subscribed and have full access until {formatDate(currentPeriodEnd)}.</p>
        <p className="bp-status-text">Your subscription will end on {formatDate(currentPeriodEnd)}.</p>
      </StatusPanel>
    );
  } else if (complimentaryAccessUntil) {
    panel = (
      <StatusPanel tone="success" badge="Complimentary access" heading="You have complimentary access">
        <p className="bp-status-text">Your editing access is granted until {formatDate(complimentaryAccessUntil)}.</p>
      </StatusPanel>
    );
  } else {
    panel = (
      <StatusPanel tone="neutral" badge="No active subscription" heading="No active subscription">
        <p className="bp-status-text">Your portfolio is still live, but editing is locked.</p>
      </StatusPanel>
    );
  }

  let ctaLabel;
  let ctaAction;
  if (isPastDue) {
    ctaLabel = 'Update payment method';
    ctaAction = handleManageBilling;
  } else if (hasEditingAccess && (isTrialing || isActive)) {
    // Covers both the plain "manage" case and the cancelled-but-still-active
    // case — Stripe's hosted portal is also where a scheduled cancellation
    // can be undone, so "Restart subscription" during a trial resolves here.
    ctaLabel = isTrialing && cancelAtPeriodEnd ? 'Restart subscription' : 'Manage subscription';
    ctaAction = handleManageBilling;
  } else if (hasEditingAccess) {
    // Complimentary access — nothing to manage via Stripe.
    ctaLabel = null;
  } else if (canStartTrial) {
    ctaLabel = 'Start 7-day free trial';
    ctaAction = handleCheckout;
  } else {
    ctaLabel = 'Restart subscription';
    ctaAction = handleCheckout;
  }

  return (
    <div className="bp-panel">
      {panel}

      <div className="bp-card">
        <h3 className="bp-title">Plan &amp; billing</h3>
        <p className="bp-desc">Workfolio — {PRICE_LABEL}/month after your 7-day free trial.</p>

        {!hasEditingAccess && !canStartTrial && (
          <p className="bp-desc">You&rsquo;ve already used your free trial — restarting will bill immediately.</p>
        )}

        {actionError && <p className="bp-error">{actionError}</p>}

        {ctaLabel && (
          <button className="bp-btn-primary" onClick={ctaAction} disabled={busy}>
            {busy ? 'Loading…' : ctaLabel}
          </button>
        )}
      </div>

      <AccessCodeRedeemForm onRedeemed={refresh} />
    </div>
  );
}
