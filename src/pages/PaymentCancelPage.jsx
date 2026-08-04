import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentStatusPage.css';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="pay-status-page">
      <div className="pay-status-card">
        <h1 className="pay-status-title">Checkout canceled</h1>
        <p className="pay-status-desc">
          No changes were made — your account and portfolio are exactly as they were.
        </p>
        <div className="pay-status-actions">
          <button className="pay-status-btn" onClick={() => navigate('/dashboard?tab=billing')}>
            Back to billing
          </button>
          <button className="pay-status-btn-secondary" onClick={() => navigate('/dashboard')}>
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
