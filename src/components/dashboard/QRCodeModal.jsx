import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import './QRCodeModal.css';

export default function QRCodeModal({ url, slug, onClose }) {
  const qrRef = useRef(null);

  function downloadPNG() {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const link = document.createElement('a');
      link.download = `${slug}-qr-code.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }

  function downloadSVG() {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `${slug}-qr-code.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="qr-backdrop" onClick={onClose}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        <button className="qr-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="qr-title">Your Portfolio QR Code</h2>
        <p className="qr-subtitle">
          Print it on your resume, business card, or anywhere you want people to find you.
        </p>

        <div className="qr-code-wrapper" ref={qrRef}>
          <QRCode
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="M"
          />
        </div>

        <p className="qr-url">{url}</p>

        <div className="qr-actions">
          <button className="qr-btn-primary" onClick={downloadPNG}>
            ⬇ Download PNG
          </button>
          <button className="qr-btn-secondary" onClick={downloadSVG}>
            ⬇ Download SVG
          </button>
        </div>

        <p className="qr-hint">
          PNG works in Word, Canva, and most design tools.<br />
          SVG is best for print.
        </p>
      </div>
    </div>
  );
}
