import React, { useState, useEffect, useMemo } from 'react';
import './Typewriter.css';

const TYPING_SPEED = 150;
const BACKSPACE_SPEED = 50;
const PAUSE_DURATION = 1500;

function Typewriter({ typeWriterText = [] }) {
  const [skill, setSkill] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);
  const [isFullyDisplayed, setIsFullyDisplayed] = useState(false);

  useEffect(() => {
    if (!typeWriterText.length) return;

    const interval = setInterval(() => {
      const currentWord = typeWriterText[index % typeWriterText.length];

      if (isDeleting) {
        setSkill(prev => prev.substring(0, prev.length - 1));
        if (skill.length <= 1) {
          setIsDeleting(false);
          setIsFullyDisplayed(false);
          setIndex(prev => (prev + 1) % typeWriterText.length);
        }
      } else {
        setSkill(currentWord.substring(0, skill.length + 1));
        if (skill === currentWord) {
          setIsFullyDisplayed(true);
          setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
        }
      }
    }, isFullyDisplayed ? BACKSPACE_SPEED : TYPING_SPEED);

    return () => clearInterval(interval);
  }, [skill, isDeleting, index, isFullyDisplayed, typeWriterText]);

  const blinkingCursor = useMemo(() => (
    isFullyDisplayed ? null : <span className="blinking-cursor">_</span>
  ), [isFullyDisplayed]);

  if (!typeWriterText.length) return null;

  return <p>{skill}{blinkingCursor}</p>;
}

export default Typewriter;
