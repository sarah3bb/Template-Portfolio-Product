import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Briefcase } from "lucide-react";
import "./InteractiveTimeline.css";

const timelineData = [
  {
    id: 1,
    year: "Apr 2026 - Present",
    title: "Area Sales Manager",
    company: "Kimberly-Clark",
    location: "Sydney, Australia",
    description: "",
    technologies: [],
    achievements: ["Increased performance by 40%", "Led team of 8 developers"],
  },
  {
    id: 2,
    year: "Feb 2025 - Apr 2026",
    title: "Sales & Marketing Graduate",
    company: "Kimberly-Clark",
    location: "Sydney, Australia",
    description: "",
    technologies: ["Assistant to Customer Business Manager (Sales Rotation)", "Baby & Child Care Category Woolworths (Huggies Brand)", "Assistant to Marketing Manager (Marketing Rotation)", "Adult Care Category Pharmacy (Poise & Depend Brand)"],
    achievements: ["Launched 5 products", "Built design system"],
  },
  {
    id: 3,
    year: "Dec 2022 - Nov 2024",
    title: "Customer Acquisition & Growth Lead",
    company: "IBT Australia",
    location: "Sydney, Australia",
    description: "Founded in 2017, IBT operates in the Australian education sector providing support to Australian students taking International Baccalaureate.",
    technologies: [],
    achievements: [],
  },
  {
    id: 4,
    year: "May 2022 - Dec 2022",
    title: "Sales Assistant",
    company: "IBT Australia",
    location: "Sydney, Australia",
    description: "",
    technologies: [],
    achievements: [],
  },
];

export default function InteractiveTimeline() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="timeline-wrapper">
      <div className="timeline-line" />

      {timelineData.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
        >
          <div
            className="timeline-card"
            onClick={() =>
              setSelectedItem(selectedItem === item.id ? null : item.id)
            }
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

            <p>{item.description}</p>

            <div className="timeline-tags">
              {item.technologies.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </div>

          <div className="timeline-dot" />
        </motion.div>
      ))}

      <AnimatePresence>
        {selectedItem && (
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
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const item = timelineData.find((i) => i.id === selectedItem);
                return (
                  <>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <h4>Key Achievements</h4>
                    <ul>
                      {item.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
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