import React from 'react';
import SectionWrapper from './SectionWrapper';

export default function TypewriterSection({ form, onChange }) {
  const items = form.typewriter_text || [];

  function update(index, value) {
    const updated = items.map((item, i) => i === index ? value : item);
    onChange('typewriter_text', updated);
  }

  function add() { onChange('typewriter_text', [...items, '']); }
  function remove(i) { onChange('typewriter_text', items.filter((_, idx) => idx !== i)); }

  return (
    <SectionWrapper title="Typewriter Text" icon="">
      <p className="field-help">
        These lines cycle through one at a time on your portfolio. Great for your job title, university, and city.
      </p>

      {items.map((text, i) => (
        <div key={i} className="list-item-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <input
            value={text}
            onChange={e => update(i, e.target.value)}
            placeholder="e.g. Sales Manager"
            style={{ flex: 1 }}
          />
          <button type="button" className="btn-icon btn-remove" onClick={() => remove(i)}>✕</button>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={add}>+ Add Line</button>
    </SectionWrapper>
  );
}
