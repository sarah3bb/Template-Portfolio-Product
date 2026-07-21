import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
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
  appearance: { title: 'Appearance',          subtitle: 'Customise colours, fonts, and layout.' },
  share:      { title: 'Share & Publish',     subtitle: 'Control who can see your portfolio and share your link.' },
  account:    { title: 'Account',             subtitle: 'Manage your login and plan.' },
};

const STATUS_LABEL = {
  unsaved: 'Unsaved changes',
  saving:  'Saving…',
  saved:   'Saved',
  error:   'Save failed — retry',
};

const AUTOSAVE_DELAY_MS = 1000;

/* ── Component ─────────────────────────────────────────────── */
export default function DashboardPage() {
  // All hooks at the top — React Rules of Hooks
  const { user, signOut }           = useAuth();
  const { portfolio, loading, error, save } = usePortfolio(user);
  const { syncFromSupabase, setPreference } = useTheme();

  // Reset to system preference on logout so the landing page
  // always follows the OS setting for visitors who aren't logged in.
  function handleSignOut() {
    setPreference('system');
    signOut();
  }

  // Pull the user's saved theme preference from Supabase on first login
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) syncFromSupabase(user.id); }, [user?.id]);

  const [form, setForm]           = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [sidebarOpen, setSidebar] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [status, setStatus]       = useState('idle'); // idle | unsaved | saving | saved | error

  // Load the portfolio into the form exactly once — later re-syncing on
  // every `portfolio` update would clobber edits made while a save is in flight.
  const formInitialized = useRef(false);
  const lastSavedRef     = useRef(null); // last successfully saved snapshot, for dirty-checking
  const formRef          = useRef(null); // always holds the latest form, for use inside async/debounced callbacks
  const savingRef        = useRef(false); // true while a save request is in flight — blocks concurrent saves
  const pendingRef       = useRef(false); // a save was requested while one was already in flight

  useEffect(() => {
    if (portfolio && !formInitialized.current) {
      formInitialized.current = true;
      setForm({ ...portfolio });
      lastSavedRef.current = { ...portfolio };
    }
  }, [portfolio]);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Temporary dev-only diagnostics for the tab-focus scroll/autosave issue.
  useEffect(() => {
    if (import.meta.env.DEV) console.log('[dashboard] mounted');
    return () => { if (import.meta.env.DEV) console.log('[dashboard] unmounted'); };
  }, []);

  // Debounced autosave — one timer for the whole form, reset on every edit.
  // Stored in a ref (not a local var) so the visibility-flush effect below
  // can cancel a pending debounce and save immediately instead.
  const debounceTimerRef = useRef(null);
  useEffect(() => {
    if (!form) return;
    if (JSON.stringify(form) === JSON.stringify(lastSavedRef.current)) return;

    setStatus('unsaved');
    if (import.meta.env.DEV) console.log('[autosave] pending');
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSave(formRef.current);
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(debounceTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Flush any pending autosave immediately when the tab regains focus —
  // background tabs throttle setTimeout, so the debounce could otherwise
  // sit unsaved for a long time. Also purely diagnostic logging of
  // visibility changes and scroll position, requested for this issue.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        if (import.meta.env.DEV) console.log('[dashboard] visibility state changed: hidden, scrollY =', window.scrollY);
        return;
      }
      if (import.meta.env.DEV) console.log('[dashboard] visibility state changed: visible, scrollY =', window.scrollY);
      const dirty = formRef.current && JSON.stringify(formRef.current) !== JSON.stringify(lastSavedRef.current);
      if (dirty) {
        clearTimeout(debounceTimerRef.current);
        performSave(formRef.current);
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll position per tab — single listener for the component's lifetime,
  // throttled to one update per animation frame.
  const scrollPositions = useRef({ content: 0, appearance: 0, share: 0, account: 0 });
  const activeTabRef    = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  useEffect(() => {
    let rafId = null;
    function handleScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        scrollPositions.current[activeTabRef.current] = window.scrollY;
        rafId = null;
      });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Restore the tab's scroll position synchronously right after its content
  // is committed to the DOM, before the browser paints.
  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositions.current[activeTab] || 0);
  }, [activeTab]);

  // Core save routine, shared by autosave and the manual "Save now" button.
  async function performSave(data, { redirectOnSlugError = false } = {}) {
    if (!data) return;

    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }

    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
      return; // nothing changed since the last successful save
    }

    if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
      setSlugError('Your URL can only contain lowercase letters, numbers, and hyphens (e.g. jane-smith).');
      if (redirectOnSlugError) setActiveTab('share');
      setStatus('error');
      return;
    }

    savingRef.current = true;
    setStatus('saving');
    if (import.meta.env.DEV) console.log('[autosave] started');

    try {
      if (data.slug !== lastSavedRef.current?.slug) {
        const slugOk = await checkSlugAvailable(data.slug, user.id);
        if (!slugOk) {
          setSlugError('That URL is already taken — please choose a different one.');
          if (redirectOnSlugError) setActiveTab('share');
          setStatus('error');
          return;
        }
      }
      setSlugError('');
      await save(data);
      lastSavedRef.current = data;
      if (import.meta.env.DEV) console.log('[autosave] succeeded');
      // If newer edits landed while this save was in flight, keep showing "unsaved" —
      // the pending re-save below (or the next debounce cycle) will pick them up.
      setStatus(JSON.stringify(formRef.current) === JSON.stringify(data) ? 'saved' : 'unsaved');
    } catch (err) {
      if (import.meta.env.DEV) console.log('[autosave] failed', err);
      setStatus('error');
    } finally {
      savingRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        performSave(formRef.current);
      }
    }
  }

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
    await performSave(formRef.current, { redirectOnSlugError: true });
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
          {STATUS_LABEL[status] && (
            <span className={`save-status-${status === 'saved' ? 'success' : status}`}>
              {STATUS_LABEL[status]}
            </span>
          )}
          <button className="btn-save" onClick={handleSave} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save now'}
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
            <AccountPanel user={user} onSignOut={handleSignOut} />
          )}
        </main>
      </div>
    </div>
  );
}
