import React, { useState } from 'react';

export default function SectionWrapper({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="dash-section">
      <button
        type="button"
        className="dash-section-header"
        onClick={() => setOpen(o => !o)}
      >
        <span className="dash-section-title">
          {icon && <span className="dash-section-icon">{icon}</span>}
          {title}
        </span>
        <span className={`dash-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && <div className="dash-section-body">{children}</div>}
    </div>
  );
}
