import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPortfolioBySlug } from '../services/portfolioService';
import { mapPortfolioData } from '../utils/mapPortfolioData';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import SetupWarning from '../components/SetupWarning';

import Hero from '../components/1. Header Components/Hero/Hero';
import Achievement from '../components/2. Content Components/Achievement/Achievement';
import TimelineSection from '../components/2. Content Components/Timeline/TimelineSection';
import Projects from '../components/2. Content Components/Projects/Projects';
import AboutMe from '../components/3. Footer Components/AboutMe/AboutMe';
import ScrollToTopButton from '../components/4. Utility Components/ScrollToTopButton/ScrollToTopButton';
import Spinner from '../components/4. Utility Components/Spinner/Spinner';

export default function PortfolioPage() {
  // Hooks must come before any conditional returns (React Rules of Hooks)
  const { slug } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    async function fetchPortfolio() {
      try {
        const data = await getPortfolioBySlug(slug);
        setPortfolio(data);
        document.title = `${data.first_name} ${data.last_name}`;
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, [slug]);

  // Safe to conditionally render after all hooks
  if (!isSupabaseConfigured) return <SetupWarning />;

  if (loading) return <Spinner />;

  if (notFound) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', background: '#0f172a', color: '#f1f5f9' }}>
        <h2>Portfolio not found</h2>
        <p style={{ color: '#94a3b8' }}>The portfolio at <strong>/p/{slug}</strong> doesn't exist or isn't published yet.</p>
        <button onClick={() => navigate('/')} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
          Go Home
        </button>
      </div>
    );
  }

  const mapped = mapPortfolioData(portfolio);

  return (
    <>
      <Hero portfolio={mapped} />
      <ScrollToTopButton />
      <Achievement portfolio={mapped} />
      <TimelineSection portfolio={mapped} />
      <Projects portfolio={mapped} />
      <AboutMe portfolio={mapped} />
    </>
  );
}
