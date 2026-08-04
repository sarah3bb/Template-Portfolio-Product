/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';
import { X, Upload, AlertTriangle, FileText } from 'lucide-react';
import { importResume } from '../../services/resumeImportService';
import './ResumeImportModal.css';

const FRIENDLY_LABELS = {
  basicInfo: 'Basic information', about: 'About / Bio', linkedin: 'LinkedIn', github: 'GitHub',
  education: 'Education', experience: 'Work experience', volunteering: 'Volunteer experience',
};
const labelFor = key => FRIENDLY_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

function PrimitiveEditor({ label, value, path, confidence, onChange, multiline }) {
  const score = confidence[path];
  const low = typeof score === 'number' && score < 0.7 && value !== null && value !== '';
  const Input = multiline || String(value || '').length > 90 ? 'textarea' : 'input';
  return (
    <div className={`resume-preview-field ${low ? 'low-confidence' : ''}`}>
      <label>
        {labelFor(label)}
        {low && <span title={`Confidence: ${Math.round(score * 100)}%`}><AlertTriangle size={14} /> Check this</span>}
      </label>
      <Input rows={Input === 'textarea' ? 3 : undefined} value={value ?? ''} onChange={e => onChange(e.target.value || null)} />
    </div>
  );
}

function ValueEditor({ name, value, path, confidence, onChange }) {
  if (Array.isArray(value)) {
    return (
      <section className="resume-preview-group">
        <h4>{labelFor(name)}</h4>
        {value.length === 0 && <p className="resume-empty">Nothing found</p>}
        {value.map((item, index) => (
          <div className="resume-array-item" key={`${path}-${index}`}>
            {typeof item === 'object' && item !== null ? (
              Object.entries(item).map(([key, child]) => (
                <ValueEditor key={key} name={key} value={child} path={`${path}.${index}.${key}`} confidence={confidence} onChange={next => onChange(value.map((entry, i) => i === index ? { ...entry, [key]: next } : entry))} />
              ))
            ) : (
              <PrimitiveEditor label={`${name} ${index + 1}`} value={item} path={`${path}.${index}`} confidence={confidence} onChange={next => onChange(value.map((entry, i) => i === index ? next : entry))} />
            )}
            <button type="button" className="resume-remove" onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</button>
          </div>
        ))}
      </section>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <section className="resume-preview-group">
        <h4>{labelFor(name)}</h4>
        <div className="resume-preview-grid">
          {Object.entries(value).map(([key, child]) => (
            <ValueEditor key={key} name={key} value={child} path={`${path}.${key}`} confidence={confidence} onChange={next => onChange({ ...value, [key]: next })} />
          ))}
        </div>
      </section>
    );
  }

  return <PrimitiveEditor label={name} value={value} path={path} confidence={confidence} onChange={onChange} multiline={['about', 'description', 'bullets'].includes(name)} />;
}

export default function ResumeImportModal({ onClose, onApply }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    if (!file) return;
    setBusy(true);
    setError('');
    try { setResult(await importResume(file)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="resume-modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="resume-modal" role="dialog" aria-modal="true" aria-labelledby="resume-import-title">
        <header>
          <div><h3 id="resume-import-title">Import resume</h3><p>Review and edit everything before applying it to your portfolio.</p></div>
          <button type="button" className="resume-close" onClick={onClose} aria-label="Close"><X /></button>
        </header>

        {!result ? (
          <div className="resume-upload-step">
            <button type="button" className="resume-dropzone" onClick={() => inputRef.current?.click()}>
              {file ? <FileText size={34} /> : <Upload size={34} />}
              <strong>{file?.name || 'Choose a PDF or DOCX resume'}</strong>
              <span>Maximum file size: 10 MB</span>
            </button>
            <input ref={inputRef} hidden type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => { setFile(e.target.files?.[0] || null); setError(''); }} />
            {error && <div className="resume-error">{error}</div>}
            <div className="resume-actions"><button type="button" className="btn-add" onClick={onClose}>Cancel</button><button type="button" className="btn-save" disabled={!file || busy} onClick={analyze}>{busy ? 'Reading resume…' : 'Analyze resume'}</button></div>
          </div>
        ) : (
          <div className="resume-review-step">
            <div className="resume-confidence-note"><AlertTriangle size={17} /> Yellow fields need an extra look because the extraction confidence is below 70%.</div>
            <div className="resume-preview">
              {Object.entries(result.resume).map(([key, value]) => (
                <ValueEditor key={key} name={key} value={value} path={key} confidence={result.confidence || {}} onChange={next => setResult(current => ({ ...current, resume: { ...current.resume, [key]: next } }))} />
              ))}
            </div>
            <div className="resume-actions"><button type="button" className="btn-add" onClick={() => setResult(null)}>Choose another file</button><button type="button" className="btn-save" onClick={() => onApply(result.resume)}>Apply to portfolio</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
