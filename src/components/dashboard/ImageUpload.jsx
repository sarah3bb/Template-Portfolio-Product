import React, { useState } from 'react';
import { uploadFile, deleteFileByUrl, validateImageFile, validateResumeFile } from '../../services/uploadService';

export default function ImageUpload({ userId, folder, label, currentUrl, onUploaded, isResume = false, helpText }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = isResume ? validateResumeFile(file) : validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError('');
    try {
      if (currentUrl) await deleteFileByUrl(currentUrl);
      const url = await uploadFile(userId, folder, file);
      onUploaded(url);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleRemove() {
    if (!currentUrl) return;
    try {
      await deleteFileByUrl(currentUrl);
      onUploaded('');
    } catch {
      onUploaded('');
    }
  }

  return (
    <div className="image-upload">
      <label className="image-upload-label">{label}</label>
      {helpText && <p className="field-help">{helpText}</p>}

      {currentUrl ? (
        <div className="image-preview">
          {isResume ? (
            <a href={currentUrl} target="_blank" rel="noreferrer" className="resume-link">
              📄 View current resume (PDF)
            </a>
          ) : (
            <img src={currentUrl} alt="preview" />
          )}
          <div className="image-preview-actions">
            <label className="btn-upload-replace">
              Replace
              <input type="file" accept={isResume ? '.pdf' : 'image/*'} onChange={handleChange} hidden />
            </label>
            <button type="button" className="btn-remove" onClick={handleRemove}>Remove</button>
          </div>
        </div>
      ) : (
        <label className="upload-drop-zone">
          {uploading ? 'Uploading…' : `+ Upload ${label}`}
          <input type="file" accept={isResume ? '.pdf' : 'image/*'} onChange={handleChange} hidden disabled={uploading} />
        </label>
      )}

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
