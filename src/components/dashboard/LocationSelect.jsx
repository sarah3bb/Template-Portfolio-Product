import React, { useState, useEffect, useRef } from 'react';
import './LocationSelect.css';

/**
 * Searchable dropdown that also allows free-text input (for city fallback).
 *
 * Props:
 *  value       - current saved string value
 *  onChange    - called with a new string value on every change
 *  options     - string[] of suggestions
 *  placeholder - shown when empty
 *  disabled    - greys out and disables interaction
 *  loading     - shows spinner and loading placeholder
 *  errorText   - shown below the input (e.g. "Could not load cities")
 *  allowCustom - if true, whatever the user types is valid (not just list items)
 */
export default function LocationSelect({
  value = '',
  onChange,
  options = [],
  placeholder = 'Search…',
  disabled = false,
  loading = false,
  errorText = '',
  allowCustom = false,
}) {
  const [inputVal, setInputVal] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Keep input display in sync when parent value changes (e.g. on country change clearing city)
  useEffect(() => {
    setInputVal(value || '');
  }, [value]);

  // Close dropdown on outside click; commit typed value if allowCustom
  useEffect(() => {
    function handleMousedown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        if (allowCustom) {
          // Save whatever is typed
          if (inputVal !== value) onChange(inputVal);
        } else {
          // Revert to last confirmed value
          setInputVal(value || '');
        }
      }
    }
    document.addEventListener('mousedown', handleMousedown);
    return () => document.removeEventListener('mousedown', handleMousedown);
  }, [inputVal, value, onChange, allowCustom]);

  // Filter and cap list for performance
  const filtered = options
    .filter(o => o.toLowerCase().includes((inputVal || '').toLowerCase()))
    .slice(0, 100);

  function handleInput(e) {
    const v = e.target.value;
    setInputVal(v);
    setOpen(true);
    if (allowCustom) onChange(v); // save as user types for city
  }

  function handleSelect(opt) {
    setInputVal(opt);
    onChange(opt);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleFocus() {
    if (!disabled && !loading) setOpen(true);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
      if (!allowCustom) setInputVal(value || '');
    }
    if (e.key === 'Enter' && allowCustom) {
      setOpen(false);
    }
  }

  const showDropdown = open && !disabled && !loading && options.length > 0;

  return (
    <div className="loc-select" ref={wrapperRef}>
      <div className={`loc-input-wrap ${open && !disabled ? 'focused' : ''} ${disabled || loading ? 'disabled' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInput}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Loading cities…' : placeholder}
          disabled={disabled || loading}
          autoComplete="off"
          spellCheck="false"
          className="loc-input"
        />
        {loading ? (
          <span className="loc-spinner" />
        ) : (
          <span className={`loc-chevron ${open ? 'open' : ''}`}>▾</span>
        )}
      </div>

      {showDropdown && (
        <div className="loc-dropdown">
          {filtered.length > 0 ? (
            filtered.map(opt => (
              <button
                key={opt}
                type="button"
                className={`loc-option ${opt === value ? 'selected' : ''}`}
                onMouseDown={e => { e.preventDefault(); handleSelect(opt); }}
              >
                {opt === value && <span className="loc-tick">✓</span>}
                {opt}
              </button>
            ))
          ) : (
            <div className="loc-no-results">
              {allowCustom
                ? `No matches — your entry "${inputVal}" will be saved`
                : 'No matches found'}
            </div>
          )}
        </div>
      )}

      {errorText && <p className="loc-error">{errorText}</p>}
    </div>
  );
}
