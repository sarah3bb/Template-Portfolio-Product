import React from 'react';
import SectionWrapper from './SectionWrapper';
import { DEFAULT_CUSTOMIZATION } from '../../utils/applyCustomization';
import './CustomizeSection.css';

const COLOR_PRESETS = [
  { label: 'Gold',     value: '#c79b3b' },
  { label: 'Ocean',    value: '#0ea5e9' },
  { label: 'Forest',   value: '#16a34a' },
  { label: 'Rose',     value: '#e11d48' },
  { label: 'Violet',   value: '#7c3aed' },
  { label: 'Midnight', value: '#475569' },
];

const FONTS = [
  { label: 'Elegant',     value: 'Amethysta',   css: 'Amethysta, serif' },
  { label: 'Modern',      value: 'Poppins',      css: "'Poppins', sans-serif" },
  { label: 'Classic',     value: 'Montserrat',   css: "'Montserrat', sans-serif" },
  { label: 'Tech',        value: 'Inter',        css: "'Inter', sans-serif" },
  { label: 'Bold',        value: 'Oswald',       css: "'Oswald', sans-serif" },
];

const IMAGE_SHAPES = [
  { label: 'Circle',   value: 'circle',  icon: '●' },
  { label: 'Rounded',  value: 'rounded', icon: '▣' },
  { label: 'Square',   value: 'square',  icon: '■' },
];

const BUTTON_STYLES = [
  { label: 'Rounded', value: 'rounded', preview: '[ Button ]' },
  { label: 'Pill',    value: 'pill',    preview: '( Button )' },
  { label: 'Square',  value: 'square',  preview: '|Button|'   },
];

const CARD_STYLES = [
  { label: 'Bordered',  value: 'bordered',  desc: 'Clean outline border' },
  { label: 'Shadowed',  value: 'shadowed',  desc: 'Soft drop shadow' },
  { label: 'Minimal',   value: 'minimal',   desc: 'No border or shadow' },
];

export default function CustomizeSection({ theme, onChange }) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...(theme || {}) };

  function update(key, value) {
    onChange({ ...c, [key]: value });
  }

  function handleReset() {
    onChange({ ...DEFAULT_CUSTOMIZATION });
  }

  return (
    <SectionWrapper title="Customise Your Portfolio" icon="🎨">
      <p className="field-help" style={{ marginBottom: '1.5rem' }}>
        Choose colours, fonts, and styles. Changes are applied when you click <strong>Save Changes</strong> above.
      </p>

      {/* ── Colour ─────────────────────────── */}
      <div className="customize-group">
        <label className="customize-label">Accent Colour</label>
        <p className="field-help">Used for buttons, borders, and highlights throughout your portfolio.</p>
        <div className="color-presets">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.value}
              type="button"
              className={`color-swatch ${c.accentColor === preset.value ? 'active' : ''}`}
              style={{ background: preset.value }}
              onClick={() => update('accentColor', preset.value)}
              title={preset.label}
              aria-label={preset.label}
            >
              {c.accentColor === preset.value && <span className="swatch-tick">✓</span>}
            </button>
          ))}
          <div className="color-custom">
            <label className="color-custom-label" title="Pick a custom colour">
              <input
                type="color"
                value={c.accentColor}
                onChange={e => update('accentColor', e.target.value)}
              />
              <span>Custom</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Font ───────────────────────────── */}
      <div className="customize-group">
        <label className="customize-label">Font Style</label>
        <p className="field-help">Changes the font used across your portfolio headings and text.</p>
        <div className="font-options">
          {FONTS.map(font => (
            <button
              key={font.value}
              type="button"
              className={`font-btn ${c.fontFamily === font.value ? 'active' : ''}`}
              style={{ fontFamily: font.css }}
              onClick={() => update('fontFamily', font.value)}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Profile Photo Shape ─────────────── */}
      <div className="customize-group">
        <label className="customize-label">Profile Photo Shape</label>
        <div className="toggle-options">
          {IMAGE_SHAPES.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`toggle-btn ${c.imageShape === opt.value ? 'active' : ''}`}
              onClick={() => update('imageShape', opt.value)}
            >
              <span className="toggle-icon" style={{
                borderRadius: opt.value === 'circle' ? '50%' : opt.value === 'rounded' ? '8px' : '0',
                width: 28, height: 28, background: 'currentColor', display: 'inline-block',
              }} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Button Style ─────────────────────── */}
      <div className="customize-group">
        <label className="customize-label">Button Style</label>
        <div className="toggle-options">
          {BUTTON_STYLES.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`toggle-btn ${c.buttonStyle === opt.value ? 'active' : ''}`}
              onClick={() => update('buttonStyle', opt.value)}
            >
              <code className="btn-preview" style={{
                borderRadius: opt.value === 'pill' ? '50px' : opt.value === 'square' ? '0' : '6px',
              }}>
                {opt.preview}
              </code>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Card Style ───────────────────────── */}
      <div className="customize-group">
        <label className="customize-label">Card Style</label>
        <p className="field-help">Applies to experience timeline cards and hobby cards.</p>
        <div className="toggle-options">
          {CARD_STYLES.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`toggle-btn ${c.cardStyle === opt.value ? 'active' : ''}`}
              onClick={() => update('cardStyle', opt.value)}
            >
              <span className="card-style-label">{opt.label}</span>
              <span className="card-style-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Reset ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button type="button" className="btn-icon" onClick={handleReset}>
          ↺ Reset to defaults
        </button>
      </div>
    </SectionWrapper>
  );
}
