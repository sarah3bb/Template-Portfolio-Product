import React from 'react';
import SectionWrapper from './SectionWrapper';

export default function AboutSection({ form, onChange }) {
  return (
    <SectionWrapper title="About Me" icon="">
      <div className="form-group">
        <label>About Me Text</label>
        <p className="field-help">
          Tell visitors who you are, what you do, and what makes you unique. This text appears in the "About Me" section of your portfolio.
        </p>
        <textarea
          rows={10}
          value={form.about_me || ''}
          onChange={e => onChange('about_me', e.target.value)}
          placeholder="Write something about yourself..."
        />
      </div>
    </SectionWrapper>
  );
}
