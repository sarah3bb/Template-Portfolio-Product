import React from 'react';
import PreferencesSection from './PreferencesSection';
import './AccountPanel.css';

export default function AccountPanel({ user, onSignOut }) {
  return (
    <div className="acc-panel">

      {/* Account info */}
      <div className="acc-card">
        <h3 className="acc-title">Your account</h3>
        <div className="acc-field">
          <span className="acc-field-label">Email address</span>
          <span className="acc-field-value">{user?.email || '—'}</span>
        </div>

        {/* Preferences — lives inside the account card for visual grouping */}
        <PreferencesSection userId={user?.id} />
      </div>

      {/* Sign out */}
      <div className="acc-card">
        <h3 className="acc-title">Sign out</h3>
        <p className="acc-desc">You can sign back in at any time to edit your portfolio.</p>
        <button className="acc-btn-danger" onClick={onSignOut}>
          Sign Out
        </button>
      </div>

      {/* Billing placeholder */}
      <div className="acc-card acc-card-muted">
        <div className="acc-coming-soon">Coming soon</div>
        <h3 className="acc-title">Plan & billing</h3>
        <p className="acc-desc">
          Upgrade to unlock custom domains, premium themes, analytics, and more.
          Billing powered by Stripe — coming soon.
        </p>
        <div className="acc-plan-badge">Free Plan</div>
      </div>

    </div>
  );
}
