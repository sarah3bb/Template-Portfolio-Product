import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import './ScrollToTopButton.css';

const REVEAL_THRESHOLD_PX = 300;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > REVEAL_THRESHOLD_PX);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  );
}
