import React, { useState } from 'react';
import SectionWrapper from './SectionWrapper';

const emptyEntry = () => ({
  id: Date.now(),
  year: '',
  title: '',
  company: '',
  location: '',
  description: '',
  technologies: [],
  achievements: [],
});

// Each entry manages its own raw text state for the two tricky fields
// (comma-separated roles and multiline achievements). Raw text is only
// parsed back to an array when the field loses focus, which means
// spaces and newlines are never stripped mid-typing.
function ExperienceEntry({ item, index, onUpdate, onRemove, onMoveUp, isFirst }) {
  const [techRaw, setTechRaw] = useState((item.technologies || []).join(', '));
  const [achievementsRaw, setAchievementsRaw] = useState((item.achievements || []).join('\n'));

  function handleTechBlur() {
    onUpdate(index, 'technologies', techRaw.split(',').map(s => s.trim()).filter(Boolean));
  }

  function handleAchievementsBlur() {
    onUpdate(index, 'achievements', achievementsRaw.split('\n').map(s => s.trim()).filter(Boolean));
  }

  return (
    <div className="list-item-card">
      <div className="list-item-controls">
        <button type="button" className="btn-icon" onClick={() => onMoveUp(index)} disabled={isFirst} title="Move up">↑</button>
        <button type="button" className="btn-icon btn-remove" onClick={() => onRemove(index)} title="Remove">✕</button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Job Title</label>
          <input
            value={item.title}
            onChange={e => onUpdate(index, 'title', e.target.value)}
            placeholder="Sales Manager"
          />
        </div>
        <div className="form-group">
          <label>Company</label>
          <input
            value={item.company}
            onChange={e => onUpdate(index, 'company', e.target.value)}
            placeholder="Kimberly-Clark"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date Range</label>
          <input
            value={item.year}
            onChange={e => onUpdate(index, 'year', e.target.value)}
            placeholder="Jan 2023 – Present"
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            value={item.location}
            onChange={e => onUpdate(index, 'location', e.target.value)}
            placeholder="Sydney, Australia"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          rows={3}
          value={item.description}
          onChange={e => onUpdate(index, 'description', e.target.value)}
          placeholder="Describe your role and responsibilities..."
        />
      </div>

      <div className="form-group">
        <label>Roles / Sub-positions (comma separated)</label>
        <p className="field-help">e.g. National Account Executive, Assistant Brand Manager</p>
        <input
          value={techRaw}
          onChange={e => setTechRaw(e.target.value)}
          onBlur={handleTechBlur}
          placeholder="National Account Executive, Brand Manager"
        />
      </div>

      <div className="form-group">
        <label>Key Achievements (one per line — shown in the popup)</label>
        <textarea
          rows={4}
          value={achievementsRaw}
          onChange={e => setAchievementsRaw(e.target.value)}
          onBlur={handleAchievementsBlur}
          placeholder={"Increased sales by 40%\nLed a team of 8"}
        />
      </div>
    </div>
  );
}

export default function ExperienceSection({ form, onChange }) {
  const items = form.experience || [];

  function update(index, field, value) {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onChange('experience', updated);
  }

  function add() {
    onChange('experience', [...items, emptyEntry()]);
  }

  function remove(index) {
    onChange('experience', items.filter((_, i) => i !== index));
  }

  function moveUp(index) {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange('experience', updated);
  }

  return (
    <SectionWrapper title="Experience / Work History" icon="💼">
      <p className="field-help">These entries appear on the timeline on your portfolio. Most recent first.</p>

      {items.map((item, i) => (
        <ExperienceEntry
          key={item.id || i}
          item={item}
          index={i}
          onUpdate={update}
          onRemove={remove}
          onMoveUp={moveUp}
          isFirst={i === 0}
        />
      ))}

      <button type="button" className="btn-add" onClick={add}>+ Add Experience Entry</button>
    </SectionWrapper>
  );
}
