import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import './PaymentStatusPage.css';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30000;

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { hasEditingAccess, refresh } = useSubscription();
  const [timedOut, setTimedOut] = useState(false);
  const startedAtRef = useRef(Date.now());

  // This page never grants access itself — it only reflects state that the
  // Stripe webhook writes asynchronously. Poll for a limited window so the
  // UI updates itself once the webhook lands, without blocking forever.
  useEffect(() => {
    if (hasEditingAccess) return;

    const interval = setInterval(() => {
      if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
        setTimedOut(true);
        clearInterval(interval);
        return;
      }
      refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasEditingAccess, refresh]);

  return (
    <div className="pay-status-page">
      <div className="pay-status-card">
        {hasEditingAccess ? (
          <>
            <h1 className="pay-status-title">You&rsquo;re all set!</h1>
            <p className="pay-status-desc">Your subscription is active — you can now edit and publish your portfolio.</p>
            <button className="pay-status-btn" onClick={() => navigate('/dashboard')}>
              Go to dashboard
            </button>
          </>
        ) : timedOut ? (
          <>
            <h1 className="pay-status-title">Almost there</h1>
            <p className="pay-status-desc">
              Payment is confirmed and your account is being activated — this can take a
              minute. You can head to your dashboard now and it will unlock automatically.
            </p>
            <button className="pay-status-btn" onClick={() => navigate('/dashboard')}>
              Go to dashboard
            </button>
          </>
        ) : (
          <>
            <h1 className="pay-status-title">Activating your account…</h1>
            <p className="pay-status-desc">This only takes a few seconds.</p>
            <div className="pay-status-spinner" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  );
}
