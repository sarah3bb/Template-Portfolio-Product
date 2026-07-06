import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { checkSlugAvailable } from '../services/portfolioService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import SetupWarning from '../components/SetupWarning';

import BasicInfoSection from '../components/dashboard/BasicInfoSection';
import ImagesSection from '../components/dashboard/ImagesSection';
import AboutSection from '../components/dashboard/AboutSection';
import ExperienceSection from '../components/dashboard/ExperienceSection';
import SocialLinksSection from '../components/dashboard/SocialLinksSection';
import TypewriterSection from '../components/dashboard/TypewriterSection';
import AchievementsSection from '../components/dashboard/AchievementsSection';
import HobbiesSection from '../components/dashboard/HobbiesSection';
import ContactFormSection from '../components/dashboard/ContactFormSection';

import QRCodeModal from '../components/dashboard/QRCodeModal';
import '../components/dashboard/Dashboard.css';

export default function DashboardPage() {
  // Hooks must come before any conditional returns (React Rules of Hooks)
  const { user, signOut } = useAuth();
  const { portfolio, loading, saving, error, saveSuccess, save } = usePortfolio(user);

  const [form, setForm] = useState(null);
  const [slugError, setSlugError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (portfolio) setForm({ ...portfolio });
  }, [portfolio]);

  // Now safe to do conditional renders — all hooks have been called above
  if (!isSupabaseConfigured) return <SetupWarning />;

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSlugError('');

    if (!form.slug || !/^[a-z0-9-]+$/.test(form.slug)) {
      setSlugError('Your URL slug can only contain lowercase letters, numbers, and hyphens (e.g. jane-smith).');
      return;
    }

    const slugOk = await checkSlugAvailable(form.slug, user.id);
    if (!slugOk) {
      setSlugError('That URL is already taken — please choose a different one.');
      return;
    }

    try {
      await save(form);
    } catch {
      // error message is set inside usePortfolio
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      window.prompt('Copy your portfolio link:', publicUrl);
    }
  }

  if (loading) {
    return <div className="dash-loading">Loading your portfolio…</div>;
  }

  if (error && !form) {
    return (
      <div className="dash-loading" style={{ flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: '#fca5a5' }}>⚠ Could not load your portfolio: {error}</p>
        <button onClick={() => window.location.reload()} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    );
  }

  if (!form) {
    return <div className="dash-loading">Setting up your portfolio…</div>;
  }

  const publicUrl = `${window.location.origin}/p/${form.slug}`;

  return (
    <div className="dashboard-page">
      {showQR && (
        <QRCodeModal
          url={publicUrl}
          slug={form.slug}
          onClose={() => setShowQR(false)}
        />
      )}
      {/* Sticky top bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <h1>My Portfolio</h1>
          <p>Edit your details below, then click Save Changes.</p>
        </div>
        <div className="dash-topbar-right">
          <a href={publicUrl} target="_blank" rel="noreferrer" className="dash-slug-link">
            🔗 /p/{form.slug}
          </a>
          <button className="btn-copy-link" onClick={handleCopyLink} title="Copy your public portfolio link">
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
          <button className="btn-copy-link" onClick={() => setShowQR(true)} title="Download QR code">
            📱 QR Code
          </button>
          {saveSuccess && <span className="save-status-success">✓ Saved!</span>}
          {error && <span className="save-status-error">⚠ {error}</span>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button className="btn-logout" onClick={signOut}>Log Out</button>
        </div>
      </div>

      {/* Main content */}
      <div className="dash-content">
        {slugError && <div className="dash-error">{slugError}</div>}

        <BasicInfoSection form={form} onChange={handleChange} />
        <ImagesSection userId={user.id} form={form} onChange={handleChange} />
        <AboutSection form={form} onChange={handleChange} />
        <ExperienceSection form={form} onChange={handleChange} />
        <SocialLinksSection form={form} onChange={handleChange} />
        <TypewriterSection form={form} onChange={handleChange} />
        <AchievementsSection form={form} onChange={handleChange} />
        <HobbiesSection userId={user.id} form={form} onChange={handleChange} />
        <ContactFormSection form={form} onChange={handleChange} />
      </div>
    </div>
  );
}
