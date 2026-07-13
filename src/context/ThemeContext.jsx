import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const STORAGE_KEY  = 'app-theme-pref';
const VALID_PREFS  = ['system', 'light', 'dark'];

const ThemeContext = createContext(null);

/* Resolve 'system' to an actual 'light' | 'dark' value */
function resolve(pref) {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

/* Apply data-theme attribute to <html> with optional animation */
function applyTheme(pref, animate = true) {
  if (animate) {
    document.documentElement.classList.add('theme-transitioning');
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 250);
  }
  document.documentElement.setAttribute('data-theme', resolve(pref));
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return VALID_PREFS.includes(saved) ? saved : 'system';
  });

  /* Apply on mount (no animation — theme already set by inline script) */
  useEffect(() => {
    applyTheme(preference, false);
  }, []); // eslint-disable-line

  /* Re-apply + set up system media query listener when preference changes */
  useEffect(() => {
    applyTheme(preference);

    if (preference !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme('system', true);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [preference]);

  /** Change preference — saves to localStorage + Supabase if user provided */
  function setPreference(pref, userId) {
    if (!VALID_PREFS.includes(pref)) return;
    setPreferenceState(pref);
    localStorage.setItem(STORAGE_KEY, pref);

    if (userId && isSupabaseConfigured && supabase) {
      supabase
        .from('profiles')
        .update({ preferences: { theme: pref } })
        .eq('id', userId)
        .then(); // fire-and-forget
    }
  }

  /** Call after login to pull the server-side preference and sync locally */
  function syncFromSupabase(userId) {
    if (!userId || !isSupabaseConfigured || !supabase) return;
    supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        const serverPref = data?.preferences?.theme;
        if (serverPref && VALID_PREFS.includes(serverPref) && serverPref !== preference) {
          setPreferenceState(serverPref);
          localStorage.setItem(STORAGE_KEY, serverPref);
          applyTheme(serverPref, true);
        }
      });
  }

  return (
    <ThemeContext.Provider value={{ preference, setPreference, syncFromSupabase }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
