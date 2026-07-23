import React, { useEffect, useState } from 'react';
import './Typewriter.css';

const TYPE_MS = 150;
const DELETE_MS = 50;
const HOLD_MS = 1500;

/** Cycles through `words`, typing and deleting each one in turn. */
function useTypewriter(words) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const target = words.length ? words[wordIndex % words.length] : '';
  const fullyTyped = !deleting && target.length > 0 && text === target;

  useEffect(() => {
    if (!words.length) return undefined;

    if (fullyTyped) {
      const id = setTimeout(() => setDeleting(true), HOLD_MS);
      return () => clearTimeout(id);
    }

    if (deleting) {
      if (text.length === 0) {
        setDeleting(false);
        setWordIndex(i => (i + 1) % words.length);
        return undefined;
      }
      const id = setTimeout(() => setText(text.slice(0, -1)), DELETE_MS);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => setText(target.slice(0, text.length + 1)), TYPE_MS);
    return () => clearTimeout(id);
  }, [words, target, text, deleting, fullyTyped]);

  return { text, cursorVisible: !deleting && !fullyTyped };
}

export default function Typewriter({ typeWriterText = [] }) {
  const { text, cursorVisible } = useTypewriter(typeWriterText);

  if (!typeWriterText.length) return null;

  return (
    <p>
      {text}
      {cursorVisible && <span className="blinking-cursor">_</span>}
    </p>
  );
}
