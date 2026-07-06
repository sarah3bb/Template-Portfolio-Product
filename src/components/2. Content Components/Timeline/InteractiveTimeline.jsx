import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import './InteractiveTimeline.css';

export default function InteractiveTimeline({ experience = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);

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
            onClick={() => setSelectedItem(selectedItem === (item.id || index) ? null : (item.id || index))}
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
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="timeline-modal-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const item = experience.find((i, idx) => (i.id || idx) === selectedItem);
                if (!item) return null;
                return (
                  <>
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                    {item.achievements && item.achievements.length > 0 && (
                      <>
                        <h4>Key Achievements</h4>
                        <ul>
                          {item.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </>
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
