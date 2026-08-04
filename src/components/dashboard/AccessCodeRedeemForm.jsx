import React, { useState } from 'react';
import { redeemAccessCode } from '../../services/subscriptionService';
import './AccessCodeRedeemForm.css';

export default function AccessCodeRedeemForm({ onRedeemed }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { text, success }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || !code.trim()) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const result = await redeemAccessCode(code.trim());
      setMessage({ text: result.message, success: result.success });
      if (result.success) {
        setCode('');
        onRedeemed?.();
      }
    } catch (err) {
      setMessage({ text: err.message || 'Something went wrong. Please try again.', success: false });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="acr-card">
      <button
        type="button"
        className="acr-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        Have an access code? {open ? '▲' : '▼'}
      </button>

      {open && (
        <form className="acr-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="acr-input"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter code"
            maxLength={100}
          />
          <button type="submit" className="acr-submit" disabled={submitting || !code.trim()}>
            {submitting ? 'Checking…' : 'Redeem'}
          </button>
        </form>
      )}

      {message && (
        <p className={message.success ? 'acr-message-success' : 'acr-message-error'}>{message.text}</p>
      )}
    </div>
  );
}
