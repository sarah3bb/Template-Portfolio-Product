import React, { useState } from 'react';
import QRCodeModal from './QRCodeModal';
import './SharePublishPanel.css';

export default function SharePublishPanel({ form, onChange, publicUrl }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy your portfolio link:', publicUrl);
    }
  }

  return (
    <div className="sp-panel">
      {showQR && (
        <QRCodeModal
          url={publicUrl}
          slug={form.slug}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* ── Published toggle ── */}
      <div className="sp-card">
        <div className="sp-card-left">
          <h3 className="sp-card-title">Portfolio visibility</h3>
          <p className="sp-card-desc">
            {form.published
              ? 'Your portfolio is live. Anyone with the link can view it.'
              : 'Your portfolio is hidden. Only you can see it when logged in.'}
          </p>
        </div>
        <label className="sp-toggle">
          <input
            type="checkbox"
            checked={form.published ?? true}
            onChange={e => onChange('published', e.target.checked)}
          />
          <span className="sp-toggle-track">
            <span className="sp-toggle-thumb" />
          </span>
          <span className="sp-toggle-label">
            {form.published ? 'Published' : 'Hidden'}
          </span>
        </label>
      </div>

      {/* ── Public URL ── */}
      <div className="sp-card">
        <h3 className="sp-card-title">Your portfolio link</h3>
        <p className="sp-card-desc">Share this link anywhere — LinkedIn, email, your resume.</p>
        <div className="sp-url-row">
          <div className="sp-url-box">{publicUrl}</div>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="sp-btn sp-btn-ghost"
          >
            Open ↗
          </a>
        </div>
        <button className="sp-btn sp-btn-primary sp-copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied to clipboard!' : 'Copy Link'}
        </button>
      </div>

      {/* ── URL slug ── */}
      <div className="sp-card">
        <h3 className="sp-card-title">Customise your URL</h3>
        <p className="sp-card-desc">
          Your URL ends with <strong>/p/</strong> followed by your chosen name. Use only lowercase letters, numbers, and hyphens.
        </p>
        <div className="sp-slug-row">
          <span className="sp-slug-prefix">/p/</span>
          <input
            className="sp-slug-input"
            value={form.slug || ''}
            onChange={e => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="your-name"
          />
        </div>
        <p className="sp-hint">Remember to click <strong>Save Changes</strong> after editing your URL.</p>
      </div>

      {/* ── QR Code ── */}
      <div className="sp-card">
        <h3 className="sp-card-title">QR Code</h3>
        <p className="sp-card-desc">
          Download a QR code to print on your resume, business card, or email signature. Scans directly to your portfolio.
        </p>
        <button className="sp-btn sp-btn-secondary" onClick={() => setShowQR(true)}>
          Download QR Code
        </button>
      </div>
    </div>
  );
}
