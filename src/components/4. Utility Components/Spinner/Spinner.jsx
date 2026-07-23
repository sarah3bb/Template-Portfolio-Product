import React, { useEffect, useRef, useState } from 'react';
import './Spinner.css';

const LOAD_DURATION_MS = 600;

/** Drives a 0-100 progress value over a fixed duration using rAF instead of a fixed-step interval. */
function useProgress(durationMs) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let frameId;

    function tick(timestamp) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (pct < 100) frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [durationMs]);

  return progress;
}

export default function Spinner() {
  const progress = useProgress(LOAD_DURATION_MS);

  return (
    <div className="boot-overlay" role="status" aria-live="polite">
      <div className="boot-panel">
        <p className="boot-panel__label">Welcome</p>
        <div className="boot-panel__ring">
          <span className="boot-panel__percent">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
