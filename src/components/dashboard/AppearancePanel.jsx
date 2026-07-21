import React from 'react';
import { DEFAULT_CUSTOMIZATION } from '../../utils/applyCustomization';
import './AppearancePanel.css';

/* ── Option data ──────────────────────────────────────────────── */

const COLOR_PRESETS = [
  { label: 'Gold',     value: '#c79b3b' },
  { label: 'Ocean',    value: '#0ea5e9' },
  { label: 'Forest',   value: '#16a34a' },
  { label: 'Rose',     value: '#e11d48' },
  { label: 'Violet',   value: '#7c3aed' },
  { label: 'Midnight', value: '#475569' },
];

const FONTS = [
  { label: 'Elegant',   value: 'Amethysta',  css: 'Amethysta, serif' },
  { label: 'Modern',    value: 'Poppins',     css: "'Poppins', sans-serif" },
  { label: 'Classic',   value: 'Montserrat',  css: "'Montserrat', sans-serif" },
  { label: 'Tech',      value: 'Inter',       css: "'Inter', sans-serif" },
  { label: 'Bold',      value: 'Oswald',      css: "'Oswald', sans-serif" },
];

const IMAGE_SHAPES = [
  { label: 'Circle',  value: 'circle',  radius: '50%' },
  { label: 'Rounded', value: 'rounded', radius: '12px' },
  { label: 'Square',  value: 'square',  radius: '0' },
];

const BUTTON_STYLES = [
  { label: 'Rounded', value: 'rounded', radius: '8px' },
  { label: 'Pill',    value: 'pill',    radius: '50px' },
  { label: 'Square',  value: 'square',  radius: '0' },
];

const CARD_STYLES = [
  { label: 'Bordered', value: 'bordered', desc: 'Outline border' },
  { label: 'Shadowed', value: 'shadowed', desc: 'Drop shadow' },
  { label: 'Minimal',  value: 'minimal',  desc: 'No border' },
];

const SPACINGS = [
  { label: 'Compact',      value: 'compact',      desc: 'Tighter sections' },
  { label: 'Comfortable',  value: 'comfortable',  desc: 'Default' },
  { label: 'Spacious',     value: 'spacious',     desc: 'More breathing room' },
];

const LAYOUTS = [
  { label: 'Classic',  value: 'classic',  desc: 'Rich, decorative look' },
  { label: 'Modern',   value: 'modern',   desc: 'Clean and polished' },
  { label: 'Minimal',  value: 'minimal',  desc: 'Stripped back, elegant' },
];

const HEADER_STYLES = [
  { label: 'Side by Side', value: 'split',    desc: 'Photo on the right' },
  { label: 'Centred',      value: 'centered', desc: 'Photo above text' },
];

/* ── Mini preview ─────────────────────────────────────────────── */

function StylePreview({ c }) {
  const accent     = c.accentColor  || '#c79b3b';
  const font       = c.fontFamily   || 'Amethysta';
  const btnRadius  = c.buttonStyle  === 'pill'    ? '50px' : c.buttonStyle === 'square'  ? '0' : '8px';
  const imgRadius  = c.imageShape   === 'circle'  ? '50%'  : c.imageShape  === 'rounded' ? '12px' : '0';
  const cardShadow = c.cardStyle    === 'shadowed' ? '0 4px 20px rgba(0,0,0,0.2)' : 'none';
  const cardBorder = c.cardStyle    === 'bordered' ? `1px solid ${accent}55` : 'none';

  return (
    <div className="ap-preview" style={{ fontFamily: `'${font}', serif` }}>
      <span className="ap-preview-label">Preview</span>
      <div className="ap-preview-body">
        {/* Avatar */}
        <div className="ap-preview-avatar" style={{
          borderRadius: imgRadius,
          background: `${accent}22`,
          border: `3px solid ${accent}`,
        }} />

        {/* Text block */}
        <div className="ap-preview-text">
          <div className="ap-preview-name" style={{ fontFamily: `'${font}', serif`, color: '#f1f5f9' }}>
            Jane Smith
          </div>
          <div className="ap-preview-job" style={{ color: accent }}>Sales Manager</div>
        </div>

        {/* Button */}
        <button className="ap-preview-btn" style={{ borderRadius: btnRadius, background: accent, border: `1px solid ${accent}` }}>
          Buttons
        </button>

        {/* Card */}
        <div className="ap-preview-card" style={{ border: cardBorder, boxShadow: cardShadow }}>
          <div style={{ color: accent, fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>
            2024 – Present
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>
            Sales Manager
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Kimberly-Clark
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */

export default function AppearancePanel({ theme, onChange }) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...(theme || {}) };

  function update(key, value) {
    onChange({ ...c, [key]: value });
  }

  function handleReset() {
    onChange({ ...DEFAULT_CUSTOMIZATION });
  }

  return (
    <div className="ap-panel">
      <div className="ap-layout">

        {/* ── Controls column ─────────────────────── */}
        <div className="ap-controls">

          {/* Accent Colour */}
          <div className="ap-group">
            <label className="ap-label">Accent Colour</label>
            <p className="field-help">Used for buttons, borders, and highlights.</p>
            <div className="ap-color-row">
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  className={`ap-swatch ${c.accentColor === p.value ? 'active' : ''}`}
                  style={{ background: p.value }}
                  onClick={() => update('accentColor', p.value)}
                  title={p.label}
                >
                  {c.accentColor === p.value && <span>✓</span>}
                </button>
              ))}
              <label className="ap-color-custom" title="Pick a custom colour">
                <input type="color" value={c.accentColor} onChange={e => update('accentColor', e.target.value)} />
                <span>Custom</span>
              </label>
            </div>
          </div>

          {/* Background Colour */}
          <div className="ap-group">
            <label className="ap-label">Page Background</label>
            <p className="field-help">Sets the colour behind all sections. Leave empty for the default dark design.</p>
            <div className="ap-color-row">
              {[
                { label: 'Default', value: '' },
                { label: 'Near Black', value: '#0f172a' },
                { label: 'Dark Blue', value: '#1e293b' },
                { label: 'Dark Grey', value: '#1c1c1e' },
                { label: 'Off White', value: '#f8fafc' },
              ].map(p => (
                <button
                  key={p.value}
                  type="button"
                  className={`ap-swatch ${(c.bgColor || '') === p.value ? 'active' : ''}`}
                  style={{ background: p.value || '#0f172a', border: !p.value ? '2px dashed #475569' : undefined }}
                  onClick={() => update('bgColor', p.value)}
                  title={p.label}
                >
                  {(c.bgColor || '') === p.value && <span style={{ color: p.value ? undefined : '#fff' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="ap-group">
            <label className="ap-label">Font Style</label>
            <div className="ap-toggle-row">
              {FONTS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  className={`ap-font-btn ${c.fontFamily === f.value ? 'active' : ''}`}
                  style={{ fontFamily: f.css }}
                  onClick={() => update('fontFamily', f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Header Style */}
          <div className="ap-group">
            <label className="ap-label">Header Layout</label>
            <p className="field-help">How your name and photo are arranged at the top.</p>
            <div className="ap-toggle-row">
              {HEADER_STYLES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ap-choice-btn ${c.headerStyle === opt.value ? 'active' : ''}`}
                  onClick={() => update('headerStyle', opt.value)}
                >
                  <span className="ap-choice-name">{opt.label}</span>
                  <span className="ap-choice-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Photo Shape */}
          <div className="ap-group">
            <label className="ap-label">Profile Photo Shape</label>
            <div className="ap-toggle-row">
              {IMAGE_SHAPES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ap-choice-btn ${c.imageShape === opt.value ? 'active' : ''}`}
                  onClick={() => update('imageShape', opt.value)}
                >
                  <span className="ap-shape-icon" style={{ borderRadius: opt.radius }} />
                  <span className="ap-choice-name">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div className="ap-group">
            <label className="ap-label">Button Style</label>
            <div className="ap-toggle-row">
              {BUTTON_STYLES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ap-choice-btn ${c.buttonStyle === opt.value ? 'active' : ''}`}
                  onClick={() => update('buttonStyle', opt.value)}
                >
                  <span className="ap-btn-preview" style={{ borderRadius: opt.radius }}>Btn</span>
                  <span className="ap-choice-name">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Style */}
          <div className="ap-group">
            <label className="ap-label">Card Style</label>
            <p className="field-help">Applies to experience and hobby cards.</p>
            <div className="ap-toggle-row">
              {CARD_STYLES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ap-choice-btn ${c.cardStyle === opt.value ? 'active' : ''}`}
                  onClick={() => update('cardStyle', opt.value)}
                >
                  <span className="ap-choice-name">{opt.label}</span>
                  <span className="ap-choice-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section Spacing */}
          <div className="ap-group">
            <label className="ap-label">Section Spacing</label>
            <p className="field-help">Controls how much space appears between each section.</p>
            <div className="ap-toggle-row">
              {SPACINGS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ap-choice-btn ${c.sectionSpacing === opt.value ? 'active' : ''}`}
                  onClick={() => update('sectionSpacing', opt.value)}
                >
                  <span className="ap-choice-name">{opt.label}</span>
                  <span className="ap-choice-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Style */}
          <div className="ap-group">
            <label className="ap-label">Overall Style</label>
            <p className="field-help">Changes the general visual weight of the whole portfolio.</p>
            <div className="ap-toggle-row">
              {LAYOUTS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ap-choice-btn ${c.layoutStyle === opt.value ? 'active' : ''}`}
                  onClick={() => update('layoutStyle', opt.value)}
                >
                  <span className="ap-choice-name">{opt.label}</span>
                  <span className="ap-choice-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ap-reset-row">
            <button type="button" className="btn-icon" onClick={handleReset}>
              ↺ Reset to defaults
            </button>
          </div>
        </div>

        {/* ── Live preview column ──────────────────── */}
        <div className="ap-preview-col">
          <div className="ap-preview-sticky">
            <StylePreview c={c} />
            <p className="ap-preview-note">
              Save Changes to see the full update on your live portfolio.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
