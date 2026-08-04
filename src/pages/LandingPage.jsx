import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { startCheckout } from '../services/subscriptionService';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: subLoading, hasEditingAccess, canStartTrial, canRestartSubscription } = useSubscription();
  const [starting, setStarting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Signed-out -> account creation with an intended trial-signup destination.
  // Signed-in + eligible -> straight into checkout.
  // Signed-in + already has access -> dashboard.
  // Signed-in + former subscriber / expired trial -> billing, to restart.
  async function handleStartTrial() {
    setCheckoutError('');

    if (!user) {
      navigate('/login?intent=trial');
      return;
    }
    if (subLoading || starting) return;

    if (hasEditingAccess) {
      navigate('/dashboard');
      return;
    }
    if (canRestartSubscription) {
      navigate('/dashboard?tab=billing');
      return;
    }
    if (canStartTrial) {
      setStarting(true);
      try {
        const { url } = await startCheckout(crypto.randomUUID());
        window.location.href = url;
      } catch (err) {
        setStarting(false);
        setCheckoutError(err.message || 'Could not start checkout. Please try again.');
      }
      return;
    }

    // Any other state (e.g. incomplete/paused subscription) — send to billing.
    navigate('/dashboard?tab=billing');
  }

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <span className="landing-logo">Workfolio - Easiest Portfolio Builder</span>
        <button className="landing-btn-outline" onClick={() => navigate('/login')}>
          Log In / Sign Up
        </button>
      </nav>

      <div className="landing-hero">
        <h1>Build your portfolio today<br />No code required!</h1>
        <p>
          Create a beautiful, professional portfolio in minutes. Upload your photos,
          fill in your details, and share your public link — no coding, no GitHub,
          no config files.
        </p>
        <div className="landing-cta">
          <button className="landing-btn-primary" onClick={handleStartTrial} disabled={starting}>
            {starting ? 'Loading…' : "Get Started — It's Free"}
          </button>
          <button className="landing-btn-secondary" onClick={() => navigate('/p/demo')}>
            See a Demo Portfolio
          </button>
        </div>
        {checkoutError && <p className="landing-cta-error">{checkoutError}</p>}
      </div>

      <div className="landing-steps">
        <div className="landing-step">
          <span className="step-number">1</span>
          <h3>Sign up</h3>
          <p>Create a free account with your email address.</p>
        </div>
        <div className="landing-step">
          <span className="step-number">2</span>
          <h3>Fill in your details</h3>
          <p>Add your name, job title, experience, photos, and more.</p>
        </div>
        <div className="landing-step">
          <span className="step-number">3</span>
          <h3>Share your link</h3>
          <p>Get a public URL like <code>yoursite.com/p/your-name</code> and share it anywhere.</p>
        </div>
      </div>
    </div>
  );
}
