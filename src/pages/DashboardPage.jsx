import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { useTheme } from '../context/ThemeContext';
import { checkSlugAvailable } from '../services/portfolioService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import SetupWarning from '../components/SetupWarning';

// Content sections
import BasicInfoSection     from '../components/dashboard/BasicInfoSection';
import ImagesSection        from '../components/dashboard/ImagesSection';
import AboutSection         from '../components/dashboard/AboutSection';
import ExperienceSection    from '../components/dashboard/ExperienceSection';
import SocialLinksSection   from '../components/dashboard/SocialLinksSection';
import TypewriterSection    from '../components/dashboard/TypewriterSection';
import AchievementsSection  from '../components/dashboard/AchievementsSection';
import HobbiesSection       from '../components/dashboard/HobbiesSection';
import ContactFormSection   from '../components/dashboard/ContactFormSection';

// Panels for other tabs
import AppearancePanel    from '../components/dashboard/AppearancePanel';
import SharePublishPanel  from '../components/dashboard/SharePublishPanel';
import AccountPanel       from '../components/dashboard/AccountPanel';

import '../components/dashboard/Dashboard.css';

/* ── Sidebar nav items ─────────────────────────────────────── */
const NAV = [
  { id: 'content',    label: 'Portfolio Content' },
  { id: 'appearance', label: 'Appearance'        },
  { id: 'share',      label: 'Share & Publish'   },
  { id: 'account',    label: 'Account'           },
];

const PANEL_META = {
  content:    { title: 'Portfolio Content',  subtitle: 'Edit everything that appears on your portfolio.' },
  appearance: { title: 'Appearance',          subtitle: 'Customise colours, fonts, and layout. Save Changes to apply.' },
  share:      { title: 'Share & Publish',     subtitle: 'Control who can see your portfolio and share your link.' },
  account:    { title: 'Account',             subtitle: 'Manage your login and plan.' },
};

/* ── Component ─────────────────────────────────────────────── */
export default function DashboardPage() {
  // All hooks at the top — React Rules of Hooks
  const { user, signOut }                                          = useAuth();
  const { portfolio, loading, saving, error, saveSuccess, save }   = usePortfolio(user);
  const { syncFromSupabase }                                       = useTheme();

  // Pull the user's saved theme preference from Supabase on first login
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) syncFromSupabase(user.id); }, [user?.id]);

  const [form, setForm]           = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [sidebarOpen, setSidebar] = useState(false);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (portfolio) setForm({ ...portfolio });
  }, [portfolio]);

  // Safe to conditionally render after all hooks
  if (!isSupabaseConfigured) return <SetupWarning />;

  if (loading) return <div className="dash-loading">Loading your portfolio…</div>;

  if (error && !form) {
    return (
      <div className="dash-loading" style={{ flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: '#fca5a5' }}>⚠ Could not load your portfolio: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!form) return <div className="dash-loading">Setting up your portfolio…</div>;

  const publicUrl = `${window.location.origin}/p/${form.slug}`;

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSlugError('');

    if (!form.slug || !/^[a-z0-9-]+$/.test(form.slug)) {
      setSlugError('Your URL can only contain lowercase letters, numbers, and hyphens (e.g. jane-smith).');
      setActiveTab('share');
      return;
    }

    const slugOk = await checkSlugAvailable(form.slug, user.id);
    if (!slugOk) {
      setSlugError('That URL is already taken — please choose a different one.');
      setActiveTab('share');
      return;
    }

    try {
      await save(form);
    } catch {
      // error is set by usePortfolio
    }
  }

  function switchTab(id) {
    setActiveTab(id);
    setSidebar(false); // close on mobile after selection
  }

  const meta = PANEL_META[activeTab];

  return (
    <div className="dashboard-page">

      {/* ── Top bar ───────────────────────────────────── */}
      <header className="dash-topbar">
        <div className="dash-topbar-left">
          <button
            className="dash-hamburger"
            onClick={() => setSidebar(o => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <span className="dash-topbar-brand">Workfolio</span>
        </div>
        <div className="dash-topbar-right">
          {saveSuccess && <span className="save-status-success">✓ Saved!</span>}
          {error       && <span className="save-status-error">⚠ {error}</span>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* ── Shell: sidebar + main ─────────────────────── */}
      <div className="dash-shell">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="dash-sidebar-overlay" onClick={() => setSidebar(false)} />
        )}

        {/* Sidebar */}
        <nav className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="dash-nav-section">
            {NAV.map(item => (
              <button
                key={item.id}
                className={`dash-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => switchTab(item.id)}
              >
                  {item.label}
              </button>
            ))}
          </div>

          <div className="dash-sidebar-footer">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="dash-portfolio-link"
              title="Open your portfolio"
            >
              {publicUrl.replace('https://', '')}
            </a>
          </div>
        </nav>

        {/* Main content area */}
        <main className="dash-main">
          <div className="dash-panel-header">
            <h2 className="dash-panel-title">{meta.title}</h2>
            <p className="dash-panel-subtitle">{meta.subtitle}</p>
          </div>
          <hr className="dash-panel-divider" />

          {slugError && <div className="dash-error">{slugError}</div>}

          {/* ── Content tab ─────────────────────── */}
          {activeTab === 'content' && (
            <div className="dash-content">
              <BasicInfoSection    form={form} onChange={handleChange} />
              <ImagesSection       userId={user.id} form={form} onChange={handleChange} />
              <AboutSection        form={form} onChange={handleChange} />
              <ExperienceSection   form={form} onChange={handleChange} />
              <SocialLinksSection  form={form} onChange={handleChange} />
              <TypewriterSection   form={form} onChange={handleChange} />
              <AchievementsSection form={form} onChange={handleChange} />
              <HobbiesSection      userId={user.id} form={form} onChange={handleChange} />
              <ContactFormSection  form={form} onChange={handleChange} />
            </div>
          )}

          {/* ── Appearance tab ──────────────────── */}
          {activeTab === 'appearance' && (
            <AppearancePanel
              theme={form.theme || {}}
              onChange={value => handleChange('theme', value)}
            />
          )}

          {/* ── Share & Publish tab ─────────────── */}
          {activeTab === 'share' && (
            <SharePublishPanel
              form={form}
              onChange={handleChange}
              publicUrl={publicUrl}
            />
          )}

          {/* ── Account tab ─────────────────────── */}
          {activeTab === 'account' && (
            <AccountPanel user={user} onSignOut={signOut} />
          )}
        </main>
      </div>
    </div>
  );
}
