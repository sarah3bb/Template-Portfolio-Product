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

import '../components/dashboard/Dashboard.css';

export default function DashboardPage() {
  if (!isSupabaseConfigured) return <SetupWarning />;

  const { user, signOut } = useAuth();
  const { portfolio, loading, saving, error, saveSuccess, save } = usePortfolio(user);

  const [form, setForm] = useState(null);
  const [slugError, setSlugError] = useState('');

  // Sync form state when portfolio loads
  useEffect(() => {
    if (portfolio) setForm({ ...portfolio });
  }, [portfolio]);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSlugError('');

    // Validate slug
    if (!form.slug || !/^[a-z0-9-]+$/.test(form.slug)) {
      setSlugError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }

    const slugOk = await checkSlugAvailable(form.slug, user.id);
    if (!slugOk) {
      setSlugError('That URL is already taken. Please choose a different one.');
      return;
    }

    try {
      await save(form);
    } catch {
      // error is set by usePortfolio
    }
  }

  if (loading || !form) {
    return <div className="dash-loading">Loading your portfolio…</div>;
  }

  const publicUrl = `${window.location.origin}/p/${form.slug}`;

  return (
    <div className="dashboard-page">
      {/* Sticky top bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <h1>Portfolio Dashboard</h1>
          <p>Edit your portfolio and click Save Changes when done.</p>
        </div>
        <div className="dash-topbar-right">
          <a href={publicUrl} target="_blank" rel="noreferrer" className="dash-slug-link">
            🔗 /p/{form.slug}
          </a>
          {saveSuccess && <span className="save-status-success">✓ Saved!</span>}
          {error && <span className="save-status-error">⚠ {error}</span>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button className="btn-logout" onClick={signOut}>Log Out</button>
        </div>
      </div>

      {/* Main form content */}
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
