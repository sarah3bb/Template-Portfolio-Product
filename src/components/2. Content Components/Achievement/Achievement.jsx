import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Achievement.css';

const Achievement = ({ portfolio }) => {
  const { achievements = [], jobTitle = '', university = '' } = portfolio || {};
  const [isVisible, setIsVisible] = useState(false);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) setIsVisible(true);
  }, [inView]);

  const counterItems = achievements.filter(a => a.value != null && a.value !== '');
  const textItems = achievements.filter(a => a.value == null || a.value === '');

  return (
    <section className="our-achievement section">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 col-md-12 col-12">
            <div className="title">
              {jobTitle && <h2>{jobTitle}</h2>}
              {university && <h3>{university}</h3>}
            </div>
          </div>
        </div>

        {textItems.length > 0 && (
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-md-12 col-12">
              <div className="achievement-text-list">
                {textItems.map((item, i) => (
                  <p key={i} className="achievement-text-item">🏆 {item.word}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {counterItems.length > 0 && (
          <div className="row">
            <div className="col-lg-8 offset-lg-2 col-md-12 col-12">
              <div className="row">
                {counterItems.map((info, index) => (
                  <div className="col-lg-4 col-md-4 col-12" key={index}>
                    <div ref={ref} className="single-achievement wow fadeInUp" data-wow-delay={`${index * 0.2}s`}>
                      {isVisible && (
                        <h3 className="counter">
                          <CountUp start={0} end={Number(info.value)} duration={4} separator="," />
                          <span>{info.unit}</span>
                        </h3>
                      )}
                      <p>{info.word}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Achievement;
