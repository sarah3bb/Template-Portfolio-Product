import React from 'react';
import SectionWrapper from './SectionWrapper';

const emptyAchievement = () => ({ word: '', value: '', unit: '' });

export default function AchievementsSection({ form, onChange }) {
  const items = form.achievements || [];

  function update(index, field, value) {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onChange('achievements', updated);
  }

  function add() { onChange('achievements', [...items, emptyAchievement()]); }
  function remove(i) { onChange('achievements', items.filter((_, idx) => idx !== i)); }

  return (
    <SectionWrapper title="Achievements" icon="🏆">
      <p className="field-help">
        Two types: <strong>text-only</strong> (leave Number blank, e.g. "Grade: Distinction") or <strong>counter</strong> (fill in a Number and Unit to show an animated count-up, e.g. "7500 finished projects").
      </p>

      {items.map((item, i) => (
        <div key={i} className="list-item-card list-item-row">
          <div className="form-group" style={{ flex: 3 }}>
            <label>Text / Label</label>
            <input value={item.word} onChange={e => update(i, 'word', e.target.value)} placeholder="e.g. Grade: Distinction" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Number (optional)</label>
            <input
              type="number"
              value={item.value || ''}
              onChange={e => update(i, 'value', e.target.value ? Number(e.target.value) : null)}
              placeholder="7500"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Unit (optional)</label>
            <input value={item.unit || ''} onChange={e => update(i, 'unit', e.target.value)} placeholder=" years" />
          </div>
          <button type="button" className="btn-icon btn-remove" onClick={() => remove(i)}>✕</button>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={add}>+ Add Achievement</button>
    </SectionWrapper>
  );
}
