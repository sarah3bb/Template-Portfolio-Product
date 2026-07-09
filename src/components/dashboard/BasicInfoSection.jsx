import React from 'react';
import SectionWrapper from './SectionWrapper';
import LocationAutocomplete from './LocationAutocomplete';

export default function BasicInfoSection({ form, onChange }) {
  // LocationAutocomplete calls this with { city, location, country, region }
  function handleLocationChange({ city, location }) {
    onChange('city', city);
    onChange('location', location);
  }

  return (
    <SectionWrapper title="Basic Info" icon="" defaultOpen={true}>

      {/* Name */}
      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input
            value={form.first_name || ''}
            onChange={e => onChange('first_name', e.target.value)}
            placeholder="Jane"
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            value={form.last_name || ''}
            onChange={e => onChange('last_name', e.target.value)}
            placeholder="Smith"
          />
        </div>
      </div>

      {/* Job + Company */}
      <div className="form-row">
        <div className="form-group">
          <label>Job Title</label>
          <input
            value={form.job_title || ''}
            onChange={e => onChange('job_title', e.target.value)}
            placeholder="e.g. Sales Manager"
          />
        </div>
        <div className="form-group">
          <label>Company Name</label>
          <input
            value={form.company_name || ''}
            onChange={e => onChange('company_name', e.target.value)}
            placeholder="e.g. Kimberly-Clark"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="form-row">
        <div className="form-group">
          <label>Email (shown on portfolio)</label>
          <input
            type="email"
            value={form.email || ''}
            onChange={e => onChange('email', e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            value={form.phone || ''}
            onChange={e => onChange('phone', e.target.value)}
            placeholder="+61 400 000 000"
          />
        </div>
      </div>

      {/* Location — single Google Places field */}
      <div className="form-group">
        <label>Location</label>
        <LocationAutocomplete
          city={form.city || ''}
          location={form.location || ''}
          onChange={handleLocationChange}
        />
        <p className="field-help">
          Start typing your city and select from the suggestions. e.g. "Sydney, Australia"
        </p>
      </div>

      {/* University */}
      <div className="form-group">
        <label>University / Education</label>
        <input
          value={form.university || ''}
          onChange={e => onChange('university', e.target.value)}
          placeholder="University of Sydney"
        />
      </div>

      {/* Slug */}
      <div className="form-group">
        <label>Your public portfolio URL</label>
        <div className="slug-input-wrapper">
          <span className="slug-prefix">/p/</span>
          <input
            value={form.slug || ''}
            onChange={e =>
              onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
            }
            placeholder="jane-smith"
          />
        </div>
        <p className="field-help">
          Lowercase letters, numbers, and hyphens only. This becomes your shareable link.
        </p>
      </div>

      {/* Published toggle */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.published ?? true}
            onChange={e => onChange('published', e.target.checked)}
          />
          Portfolio is public — visible to anyone with the link
        </label>
      </div>

    </SectionWrapper>
  );
}
