import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Achievement.css';

function Metric({ value, unit, word }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <div className="col-lg-4 col-md-4 col-12">
      <div ref={ref} className="stats-band__metric">
        {inView && (
          <h3 className="stats-band__metric-value">
            <CountUp start={0} end={Number(value)} duration={4} separator="," />
            <span>{unit}</span>
          </h3>
        )}
        <p>{word}</p>
      </div>
    </div>
  );
}

export default function Achievement({ portfolio }) {
  const { achievements = [], jobTitle = '', university = '' } = portfolio || {};

  const hasValue = item => item.value != null && item.value !== '';
  const metrics = achievements.filter(hasValue);
  const tags = achievements.filter(item => !hasValue(item));

  return (
    <section className="stats-band section">
      <div className="container">
        {(jobTitle || university) && (
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-md-12 col-12">
              <div className="stats-band__heading">
                {jobTitle && <h2>{jobTitle}</h2>}
                {university && <h3>{university}</h3>}
              </div>
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-md-12 col-12">
              <div className="stats-band__tags">
                {tags.map((tag, i) => (
                  <p key={i} className="stats-band__tag">{tag.word}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {metrics.length > 0 && (
          <div className="row">
            <div className="col-lg-8 offset-lg-2 col-md-12 col-12">
              <div className="row">
                {metrics.map((metric, i) => (
                  <Metric key={i} value={metric.value} unit={metric.unit} word={metric.word} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
