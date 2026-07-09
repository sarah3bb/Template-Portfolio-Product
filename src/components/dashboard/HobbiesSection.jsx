import React from 'react';
import SectionWrapper from './SectionWrapper';
import ImageUpload from './ImageUpload';

const emptyHobby = () => ({ title: '', description: '', demoUrl: '' });

export default function HobbiesSection({ userId, form, onChange }) {
  const items = form.hobbies || [];

  function update(index, field, value) {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onChange('hobbies', updated);
  }

  function add() { onChange('hobbies', [...items, emptyHobby()]); }
  function remove(i) { onChange('hobbies', items.filter((_, idx) => idx !== i)); }

  return (
    <SectionWrapper title="Hobbies & Interests" icon="">
      <p className="field-help">
        These appear in the "Why Work With Me" section as a photo slideshow. Add photos of things you enjoy outside of work.
      </p>

      {items.map((item, i) => (
        <div key={i} className="list-item-card">
          <div className="list-item-controls">
            <button type="button" className="btn-icon btn-remove" onClick={() => remove(i)}>✕ Remove</button>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input value={item.title} onChange={e => update(i, 'title', e.target.value)} placeholder="e.g. Hiking" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} value={item.description} onChange={e => update(i, 'description', e.target.value)} placeholder="Tell visitors a bit about this interest..." />
          </div>

          <ImageUpload
            userId={userId}
            folder="hobby-images"
            label="Photo"
            currentUrl={item.demoUrl}
            onUploaded={url => update(i, 'demoUrl', url)}
          />
        </div>
      ))}

      <button type="button" className="btn-add" onClick={add}>+ Add Hobby / Interest</button>
    </SectionWrapper>
  );
}
