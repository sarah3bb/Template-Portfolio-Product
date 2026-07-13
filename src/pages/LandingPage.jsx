import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

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
          <button className="landing-btn-primary" onClick={() => navigate('/login')}>
            Get Started — It's Free
          </button>
          <button className="landing-btn-secondary" onClick={() => navigate('/p/demo')}>
            See a Demo Portfolio
          </button>
        </div>
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
