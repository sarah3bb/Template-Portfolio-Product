import React, { useState, useEffect, useRef } from 'react';
import { useGooglePlaces, isGooglePlacesConfigured } from '../../hooks/useGooglePlaces';
import './LocationAutocomplete.css';

// Derive a clean display string from existing saved city + location fields
// so users who saved data before this feature don't see a blank field.
function deriveDisplayValue(city, location) {
  if (!city && !location) return '';
  // Already a formatted "City, Country" string
  if (location && location.includes(',')) return location;
  // Old format: location was just the country name
  if (city && location) return `${city}, ${location}`;
  return city || location || '';
}

// Extract structured data from a Google Places prediction
function extractLocationData(prediction) {
  const terms = prediction.terms || [];
  const formatted = prediction.description || '';
  const city = terms[0]?.value || '';
  const country = terms[terms.length - 1]?.value || '';
  const region = terms.length > 2 ? terms[terms.length - 2]?.value || '' : '';
  return { city, country, region, location: formatted };
}

export default function LocationAutocomplete({ city, location, onChange }) {
  const placesReady = useGooglePlaces();

  // What is displayed in the input box
  const [query, setQuery] = useState(() => deriveDisplayValue(city, location));
  const [predictions, setPredictions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const serviceRef  = useRef(null);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // Sync display when parent resets the form (e.g. after first load)
  const initialised = useRef(false);
  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      setQuery(deriveDisplayValue(city, location));
    }
  }, [city, location]);

  // Create the AutocompleteService once the Places library is ready
  useEffect(() => {
    if (placesReady && window.google?.maps?.places) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [placesReady]);

  // Close on outside click
  useEffect(() => {
    function onMousedown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMousedown);
    return () => document.removeEventListener('mousedown', onMousedown);
  }, []);

  function fetchPredictions(input) {
    if (!serviceRef.current || !input.trim()) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    serviceRef.current.getPlacePredictions(
      { input, types: ['(cities)'] },
      (results, status) => {
        setLoading(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results?.length
        ) {
          setPredictions(results.slice(0, 5));
          setOpen(true);
        } else {
          setPredictions([]);
        }
      }
    );
  }

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);

    if (!val.trim()) {
      onChange({ city: '', location: '', country: '', region: '' });
      setPredictions([]);
      setOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 300);
  }

  function handleSelect(prediction) {
    const data = extractLocationData(prediction);
    setQuery(data.location);
    setPredictions([]);
    setOpen(false);
    onChange(data);
  }

  // When user leaves the field without selecting a suggestion,
  // save whatever they typed as a plain text fallback.
  function handleBlur() {
    clearTimeout(debounceRef.current);
    setOpen(false);
    if (query.trim()) {
      onChange({
        city:     query.includes(',') ? query.split(',')[0].trim() : query.trim(),
        location: query.trim(),
        country:  '',
        region:   '',
      });
    }
  }

  // ── Fallback when no API key ──────────────────────────────────────────────
  if (!isGooglePlacesConfigured) {
    return (
      <div>
        <input
          type="text"
          defaultValue={deriveDisplayValue(city, location)}
          onBlur={e => {
            const val = e.target.value.trim();
            if (val) onChange({
              city:     val.includes(',') ? val.split(',')[0].trim() : val,
              location: val,
              country:  '',
              region:   '',
            });
          }}
          placeholder="e.g. Sydney, Australia"
          className="loc-ac-fallback-input"
        />
        <p className="field-help loc-ac-key-note">
          Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your .env to enable smart location suggestions.
        </p>
      </div>
    );
  }

  // ── Google Places autocomplete ────────────────────────────────────────────
  return (
    <div className="loc-ac" ref={wrapperRef}>
      <div className={`loc-ac-wrap ${open ? 'focused' : ''}`}>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onBlur={handleBlur}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setOpen(false); e.target.blur(); }
          }}
          placeholder="Search for your city…"
          autoComplete="off"
          spellCheck="false"
          className="loc-ac-input"
        />
        {loading && <span className="loc-ac-spinner" />}
      </div>

      {open && predictions.length > 0 && (
        <div className="loc-ac-dropdown" role="listbox">
          {predictions.map(p => (
            <button
              key={p.place_id}
              type="button"
              role="option"
              className="loc-ac-option"
              onMouseDown={e => { e.preventDefault(); handleSelect(p); }}
            >
              <span className="loc-ac-main">
                {p.structured_formatting.main_text}
              </span>
              <span className="loc-ac-secondary">
                {p.structured_formatting.secondary_text}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
