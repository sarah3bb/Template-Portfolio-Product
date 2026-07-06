import React from 'react';
import InteractiveTimeline from './InteractiveTimeline';
import './TimelineSection.css';

const TimelineSection = ({ portfolio }) => {
  return (
    <section id="Experience" className="timeline section">
      <div className="container">
        <div className="section-title">
          <h3>Experience</h3>
          <h2>My Journey</h2>
          <h5>A timeline of my experience, growth, and the technologies I've worked with</h5>
        </div>
        <InteractiveTimeline experience={portfolio?.experience || []} />
      </div>
    </section>
  );
};

export default TimelineSection;
