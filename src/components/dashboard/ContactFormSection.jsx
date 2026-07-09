import React from 'react';
import SectionWrapper from './SectionWrapper';

export default function ContactFormSection({ form, onChange }) {
  return (
    <SectionWrapper title="Contact Form (EmailJS)" icon="">
      <div className="emailjs-help">
        <strong>What is this?</strong> EmailJS lets visitors send you messages from your portfolio — without you needing a server. It's free for up to 200 emails/month.
        <br /><br />
        <strong>How to set it up (optional):</strong>
        <ol>
          <li>Go to <a href="https://www.emailjs.com" target="_blank" rel="noreferrer">emailjs.com</a> and create a free account.</li>
          <li>Add an Email Service (e.g. Gmail) — this gives you the <strong>Service ID</strong>.</li>
          <li>Create an Email Template — this gives you the <strong>Template ID</strong>.</li>
          <li>Go to Account → API Keys → copy your <strong>Public Key</strong>.</li>
          <li>Paste all three below and save.</li>
        </ol>
        <p style={{ color: '#86efac' }}>If you leave these blank, the contact form will be hidden and visitors can still email you directly.</p>
      </div>

      <div className="form-group">
        <label>EmailJS Service ID</label>
        <input
          value={form.emailjs_service_id || ''}
          onChange={e => onChange('emailjs_service_id', e.target.value)}
          placeholder="service_xxxxxxx"
        />
      </div>

      <div className="form-group">
        <label>EmailJS Template ID</label>
        <input
          value={form.emailjs_template_id || ''}
          onChange={e => onChange('emailjs_template_id', e.target.value)}
          placeholder="template_xxxxxxx"
        />
      </div>

      <div className="form-group">
        <label>EmailJS Public Key</label>
        <input
          value={form.emailjs_public_key || ''}
          onChange={e => onChange('emailjs_public_key', e.target.value)}
          placeholder="xxxxxxxxxxxxxxxxxxxx"
        />
        <p className="field-help">This is your <em>public</em> key — it's safe to store here. Never enter your private key.</p>
      </div>
    </SectionWrapper>
  );
}
