import React from 'react';
import SectionWrapper from './SectionWrapper';

const ICON_OPTIONS = [
  { label: 'LinkedIn', value: 'lni lni-linkedin' },
  { label: 'GitHub', value: 'lni lni-github' },
  { label: 'Twitter / X', value: 'lni lni-twitter' },
  { label: 'Instagram', value: 'lni lni-instagram' },
  { label: 'Facebook', value: 'lni lni-facebook' },
  { label: 'Website / Globe', value: 'lni lni-world' },
  { label: 'Email', value: 'lni lni-envelope' },
  { label: 'YouTube', value: 'lni lni-youtube' },
];

const emptyLink = () => ({ label: '', url: '', icon: 'lni lni-linkedin' });

export default function SocialLinksSection({ form, onChange }) {
  const items = form.social_links || [];

  function update(index, field, value) {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onChange('social_links', updated);
  }

  function add() { onChange('social_links', [...items, emptyLink()]); }
  function remove(i) { onChange('social_links', items.filter((_, idx) => idx !== i)); }

  return (
    <SectionWrapper title="Social Links" icon="">
      <p className="field-help">Add your social media profiles and website. These appear as icon buttons on your portfolio.</p>

      {items.map((item, i) => (
        <div key={i} className="list-item-card list-item-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Icon</label>
            <select value={item.icon} onChange={e => update(i, 'icon', e.target.value)}>
              {ICON_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Label (e.g. LinkedIn)</label>
            <input value={item.label} onChange={e => update(i, 'label', e.target.value)} placeholder="LinkedIn" />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label>URL</label>
            <input value={item.url} onChange={e => update(i, 'url', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
          </div>
          <button type="button" className="btn-icon btn-remove" onClick={() => remove(i)} title="Remove">✕</button>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={add}>+ Add Social Link</button>
    </SectionWrapper>
  );
}
