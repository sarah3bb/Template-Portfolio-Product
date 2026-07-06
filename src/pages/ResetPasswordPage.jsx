import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './LoginPage.css';

// Two modes:
//  1. /forgot-password  — user enters their email, we send a reset link
//  2. /reset-password   — user lands here from the email link and sets a new password

export default function ResetPasswordPage({ mode = 'forgot' }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Detect if Supabase put a recovery session in the URL hash
  useEffect(() => {
    if (mode === 'reset') {
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setInfo('Enter your new password below.');
        }
      });
    }
  }, [mode]);

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setInfo('Check your email for a password reset link. It may take a minute to arrive.');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setInfo('Password updated! Redirecting to your dashboard…');
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'reset') {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Set new password</h1>
          <p className="login-subtitle">Choose a new password for your account.</p>

          <form onSubmit={handleReset} className="login-form">
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Same as above" required />
            </div>

            {error && <p className="login-error">{error}</p>}
            {info && <p className="login-info">{info}</p>}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Updating…' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Forgot your password?</h1>
        <p className="login-subtitle">Enter your email and we'll send you a reset link.</p>

        <form onSubmit={handleForgot} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          {error && <p className="login-error">{error}</p>}
          {info && <p className="login-info">{info}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="login-toggle">
          Remember your password?{' '}
          <button onClick={() => navigate('/login')}>Back to log in</button>
        </p>
      </div>
    </div>
  );
}
