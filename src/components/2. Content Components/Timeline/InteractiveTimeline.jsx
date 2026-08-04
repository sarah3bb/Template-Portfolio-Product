/* eslint-disable react/prop-types */
import { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Briefcase, X, Sparkles } from 'lucide-react';
import './InteractiveTimeline.css';

export default function InteractiveTimeline({ experience = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  function openDetails(itemKey) {
    triggerRef.current = document.activeElement;
    setSelectedItem(itemKey);
  }

  function closeDetails() {
    setSelectedItem(null);
  }

  useEffect(() => {
    if (selectedItem === null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDetails();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [selectedItem]);

  const selectedExperience = experience.find((item, index) => (item.id || index) === selectedItem);

  if (!experience.length) {
    return (
      <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
        No experience entries yet. Add some from your dashboard.
      </p>
    );
  }

  return (
    <div className="timeline-wrapper">
      <div className="timeline-line" />

      {experience.map((item, index) => (
        <motion.div
          key={item.id || index}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
        >
          <div
            className="timeline-card"
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            onClick={() => openDetails(item.id || index)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openDetails(item.id || index);
              }
            }}
          >
            <div className="timeline-year">
              <Calendar size={16} />
              {item.year}
            </div>

            <h4>{item.title}</h4>

            <p className="timeline-company">
              <Briefcase size={16} />
              {item.company}
            </p>

            <p className="timeline-location">
              <MapPin size={16} />
              {item.location}
            </p>

            {item.description && <p>{item.description}</p>}

            {item.technologies && item.technologies.length > 0 && (
              <div className="timeline-tags">
                {item.technologies.map((tech, i) => (
                  <span key={i}>{tech}</span>
                ))}
              </div>
            )}
          </div>

          <div className="timeline-dot" />
        </motion.div>
      ))}

      <AnimatePresence>
        {selectedItem !== null && (
          <motion.div
            className="timeline-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onMouseDown={event => event.target === event.currentTarget && closeDetails()}
          >
            <motion.div
              ref={dialogRef}
              className="timeline-modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={selectedExperience?.description ? descriptionId : undefined}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {(() => {
                const item = experience.find((i, idx) => (i.id || idx) === selectedItem);
                if (!item) return null;
                return (
                  <>
                    <button ref={closeButtonRef} type="button" className="timeline-modal-close" onClick={closeDetails} aria-label="Close experience details">
                      <X size={20} aria-hidden="true" />
                    </button>

                    <div className="timeline-modal-eyebrow"><Briefcase size={15} aria-hidden="true" /> Experience details</div>
                    <h3 id={titleId}>{item.title}</h3>

                    <div className="timeline-modal-meta" aria-label="Role details">
                      {item.company && <span><Briefcase size={16} aria-hidden="true" />{item.company}</span>}
                      {item.location && <span><MapPin size={16} aria-hidden="true" />{item.location}</span>}
                      {item.year && <span><Calendar size={16} aria-hidden="true" />{item.year}</span>}
                    </div>

                    {item.description && <p id={descriptionId} className="timeline-modal-description">{item.description}</p>}
                    {item.achievements && item.achievements.length > 0 && (
                      <section className="timeline-modal-achievements" aria-labelledby={`${titleId}-achievements`}>
                        <h4 id={`${titleId}-achievements`}><Sparkles size={18} aria-hidden="true" />Key Achievements</h4>
                        <ul className="timeline-achievement-list">
                          {item.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
