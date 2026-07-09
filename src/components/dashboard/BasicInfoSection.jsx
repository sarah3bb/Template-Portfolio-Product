import React, { useState, useEffect } from 'react';
import { getNames } from 'country-list';
import SectionWrapper from './SectionWrapper';
import LocationSelect from './LocationSelect';

// All 249 country names, cleaned (strip " (the)" suffix) and sorted A-Z
const ALL_COUNTRIES = getNames()
  .map(n => n.replace(/\s*\(the\)\s*$/i, '').trim())
  .sort((a, b) => a.localeCompare(b));

// Module-level cache — persists for the browser session, avoids repeat API calls
const cityCache = new Map();

async function fetchCitiesForCountry(country) {
  if (cityCache.has(country)) return cityCache.get(country);

  const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.error || !Array.isArray(json.data)) throw new Error(json.msg || 'No city data');

  const sorted = [...json.data].sort((a, b) => a.localeCompare(b));
  cityCache.set(country, sorted);
  return sorted;
}

export default function BasicInfoSection({ form, onChange }) {
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState('');

  const selectedCountry = form.location || '';

  // Load cities whenever the selected country changes
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      setCitiesError('');
      return;
    }

    let cancelled = false;
    setCitiesLoading(true);
    setCitiesError('');

    fetchCitiesForCountry(selectedCountry)
      .then(data => { if (!cancelled) setCities(data); })
      .catch(() => {
        if (!cancelled) {
          setCities([]);
          setCitiesError('Could not load cities. You can still type your city manually.');
        }
      })
      .finally(() => { if (!cancelled) setCitiesLoading(false); });

    return () => { cancelled = true; };
  }, [selectedCountry]);

  function handleCountryChange(country) {
    onChange('location', country);
    // Clear city when country changes so stale values don't carry over
    if (form.city) onChange('city', '');
    setCities([]);
    setCitiesError('');
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

      {/* Country — comes first; loads city list */}
      <div className="form-row">
        <div className="form-group">
          <label>Country</label>
          <LocationSelect
            value={selectedCountry}
            onChange={handleCountryChange}
            options={ALL_COUNTRIES}
            placeholder="Select your country"
          />
        </div>

        {/* City — disabled until a country is chosen */}
        <div className="form-group">
          <label>City</label>
          <LocationSelect
            value={form.city || ''}
            onChange={v => onChange('city', v)}
            options={cities}
            placeholder={selectedCountry ? 'Select or type your city' : 'Choose a country first'}
            disabled={!selectedCountry}
            loading={citiesLoading}
            errorText={citiesError}
            allowCustom={true}
          />
        </div>
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
            onChange={e => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
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
