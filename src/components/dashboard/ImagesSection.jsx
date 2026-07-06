import React from 'react';
import SectionWrapper from './SectionWrapper';
import ImageUpload from './ImageUpload';
import { uploadFile, deleteFileByUrl, validateImageFile } from '../../services/uploadService';

export default function ImagesSection({ userId, form, onChange }) {
  async function handleLogoAdd(e) {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { alert(err); return; }
    try {
      const url = await uploadFile(userId, 'company-logos', file);
      const logos = [...(form.company_logos || []), url];
      onChange('company_logos', logos);
    } catch {
      alert('Logo upload failed. Please try again.');
    }
    e.target.value = '';
  }

  async function handleLogoRemove(index) {
    const logos = [...(form.company_logos || [])];
    await deleteFileByUrl(logos[index]).catch(() => {});
    logos.splice(index, 1);
    onChange('company_logos', logos);
  }

  return (
    <SectionWrapper title="Photos & Files" icon="🖼️">
      <ImageUpload
        userId={userId}
        folder="profile-images"
        label="Profile Photo"
        currentUrl={form.profile_image_url}
        onUploaded={url => onChange('profile_image_url', url)}
        helpText="Your headshot or professional photo. Square images work best."
      />

      <ImageUpload
        userId={userId}
        folder="background-images"
        label="Background Image"
        currentUrl={form.background_image_url}
        onUploaded={url => onChange('background_image_url', url)}
        helpText="The large image behind your name at the top of your portfolio. Leave blank for a solid colour."
      />

      <ImageUpload
        userId={userId}
        folder="resumes"
        label="Resume / CV (PDF)"
        currentUrl={form.resume_url}
        onUploaded={url => onChange('resume_url', url)}
        isResume={true}
        helpText="Upload a PDF. Visitors can download it from your portfolio."
      />

      <div className="form-group">
        <label>Company / Organisation Logos</label>
        <p className="field-help">Upload logos of companies you've worked with. They appear below your company name.</p>

        <div className="logo-grid">
          {(form.company_logos || []).map((url, i) => (
            <div key={i} className="logo-item">
              <img src={url} alt={`logo ${i + 1}`} />
              <button type="button" className="btn-remove-logo" onClick={() => handleLogoRemove(i)}>✕</button>
            </div>
          ))}
          <label className="logo-add-btn">
            + Add Logo
            <input type="file" accept="image/*" onChange={handleLogoAdd} hidden />
          </label>
        </div>
      </div>
    </SectionWrapper>
  );
}
