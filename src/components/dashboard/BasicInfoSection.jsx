import React from 'react';
import SectionWrapper from './SectionWrapper';

export default function BasicInfoSection({ form, onChange }) {
  return (
    <SectionWrapper title="Basic Info" icon="" defaultOpen={true}>
      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input value={form.first_name || ''} onChange={e => onChange('first_name', e.target.value)} placeholder="Jane" />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input value={form.last_name || ''} onChange={e => onChange('last_name', e.target.value)} placeholder="Smith" />
        </div>
      </div>

      <div className="form-group">
        <label>Job Title</label>
        <input value={form.job_title || ''} onChange={e => onChange('job_title', e.target.value)} placeholder="e.g. Sales Manager" />
      </div>

      <div className="form-group">
        <label>Company Name</label>
        <input value={form.company_name || ''} onChange={e => onChange('company_name', e.target.value)} placeholder="e.g. Kimberly-Clark" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email (shown on portfolio)</label>
          <input type="email" value={form.email || ''} onChange={e => onChange('email', e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone || ''} onChange={e => onChange('phone', e.target.value)} placeholder="+1 234 567 890" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City</label>
          <input value={form.city || ''} onChange={e => onChange('city', e.target.value)} placeholder="Sydney" />
        </div>
        <div className="form-group">
          <label>Location (full)</label>
          <input value={form.location || ''} onChange={e => onChange('location', e.target.value)} placeholder="Sydney, Australia" />
        </div>
      </div>

      <div className="form-group">
        <label>University</label>
        <input value={form.university || ''} onChange={e => onChange('university', e.target.value)} placeholder="University of Sydney" />
      </div>

      <div className="form-group">
        <label>Your Public Portfolio URL Slug</label>
        <div className="slug-input-wrapper">
          <span className="slug-prefix">/p/</span>
          <input
            value={form.slug || ''}
            onChange={e => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="jane-smith"
          />
        </div>
        <p className="field-help">Lowercase letters, numbers, and hyphens only. This is what your public link will look like.</p>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.published ?? true}
            onChange={e => onChange('published', e.target.checked)}
          />
          Portfolio is public (visible to everyone)
        </label>
      </div>
    </SectionWrapper>
  );
}
