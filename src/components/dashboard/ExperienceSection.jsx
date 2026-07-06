import React from 'react';
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

export default function ExperienceSection({ form, onChange }) {
  const items = form.experience || [];

  function update(index, field, value) {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onChange('experience', updated);
  }

  function updateTechnologies(index, value) {
    // Stored as array, edited as comma-separated string
    update(index, 'technologies', value.split(',').map(s => s.trim()).filter(Boolean));
  }

  function updateAchievements(index, value) {
    update(index, 'achievements', value.split('\n').map(s => s.trim()).filter(Boolean));
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
        <div key={item.id || i} className="list-item-card">
          <div className="list-item-controls">
            <button type="button" className="btn-icon" onClick={() => moveUp(i)} disabled={i === 0} title="Move up">↑</button>
            <button type="button" className="btn-icon btn-remove" onClick={() => remove(i)} title="Remove">✕</button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Title</label>
              <input value={item.title} onChange={e => update(i, 'title', e.target.value)} placeholder="Sales Manager" />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input value={item.company} onChange={e => update(i, 'company', e.target.value)} placeholder="Kimberly-Clark" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date Range</label>
              <input value={item.year} onChange={e => update(i, 'year', e.target.value)} placeholder="Jan 2023 – Present" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={item.location} onChange={e => update(i, 'location', e.target.value)} placeholder="Sydney, Australia" />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} value={item.description} onChange={e => update(i, 'description', e.target.value)} placeholder="Describe your role and responsibilities..." />
          </div>

          <div className="form-group">
            <label>Roles / Sub-positions (comma separated)</label>
            <input
              value={(item.technologies || []).join(', ')}
              onChange={e => updateTechnologies(i, e.target.value)}
              placeholder="e.g. National Account Exec, Brand Manager"
            />
          </div>

          <div className="form-group">
            <label>Key Achievements (one per line — shown in modal popup)</label>
            <textarea
              rows={3}
              value={(item.achievements || []).join('\n')}
              onChange={e => updateAchievements(i, e.target.value)}
              placeholder="Increased sales by 40%&#10;Led a team of 8"
            />
          </div>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={add}>+ Add Experience Entry</button>
    </SectionWrapper>
  );
}
