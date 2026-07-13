import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './PreferencesSection.css';

const OPTIONS = [
  {
    value: 'system',
    label: 'System',
    desc: 'Follows your OS setting',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="2" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 13h6M8 11v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 'light',
    label: 'Light',
    desc: 'Always light',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    desc: 'Always dark',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007-4z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function PreferencesSection({ userId }) {
  const { preference, setPreference } = useTheme();

  return (
    <div className="pref-section">
      <h3 className="pref-title">Preferences</h3>

      <div className="pref-row">
        <div className="pref-label-group">
          <span className="pref-label">Appearance</span>
          <span className="pref-desc">Controls the look of the dashboard and account pages. Your public portfolio is not affected.</span>
        </div>

        <div className="pref-segment" role="group" aria-label="Appearance">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={preference === opt.value}
              className={`pref-seg-btn ${preference === opt.value ? 'active' : ''}`}
              onClick={() => setPreference(opt.value, userId)}
              title={opt.desc}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
