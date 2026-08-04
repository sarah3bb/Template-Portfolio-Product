import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { isSafeInternalRedirect } from '../utils/redirectValidation';
import SetupWarning from '../components/SetupWarning';
import './LoginPage.css';

export default function LoginPage() {
  // Hooks must come before any conditional returns (React Rules of Hooks)
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to send the user after a successful sign-in/sign-up. Prefers the
  // page they were redirected from (ProtectedRoute's location.state.from),
  // then a validated ?next= query param, then a trial-start intent, then
  // falls back to the dashboard. Only ever resolves to an internal path —
  // never trust this for arbitrary external redirects. This is generic
  // over however the user authenticated (not tied to email/password), so
  // it keeps working unchanged if OAuth sign-in is added later.
  function resolveRedirectTarget() {
    const from = location.state?.from;
    if (isSafeInternalRedirect(from)) return from;

    const next = searchParams.get('next');
    if (isSafeInternalRedirect(next)) return next;

    if (searchParams.get('intent') === 'trial') return '/dashboard?tab=billing&intent=trial';

    return '/dashboard';
  }

  useEffect(() => {
    if (user) navigate(resolveRedirectTarget(), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // Safe to conditionally render after all hooks
  if (!isSupabaseConfigured) return <SetupWarning />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const data = await signUp(email, password, fullName);
        // If Supabase auto-confirmed (email confirmation disabled), session is set immediately
        if (data?.session) {
          navigate(resolveRedirectTarget(), { replace: true });
        } else {
          setInfo('Account created! Check your email for a confirmation link, then log in here.');
          setMode('login');
        }
      } else {
        await signIn(email, password);
        navigate(resolveRedirectTarget(), { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <button
          onClick={() => navigate('/')}
          className="login-back"
          aria-label="Back to home"
        >
          ← Back
        </button>

        <h1 className="login-title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Log in to edit your portfolio'
            : 'Build your professional portfolio in minutes — free'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}
          {info && <p className="login-info">{info}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Free Account'}
          </button>
        </form>

        <p className="login-toggle">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setInfo(''); }}>
                Sign up free
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); setInfo(''); }}>
                Log in
              </button>
            </>
          )}
        </p>

        {mode === 'login' && (
          <p className="login-toggle" style={{ marginTop: '0.5rem' }}>
            <button onClick={() => navigate('/forgot-password')} style={{ color: '#64748b' }}>
              Forgot your password?
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
