import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Projects.css';

const SLIDER_SETTINGS = {
  dots: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

function HobbySlide({ title, description, demoUrl }) {
  return (
    <div>
      <div className="showcase-card">
        <div className="showcase-card__body">
          <div className="showcase-card__header">
            <h5 className="showcase-card__title">{title}</h5>
            <p className="showcase-card__desc">{description}</p>
          </div>
          {demoUrl && (
            <div className="showcase-card__media">
              <img src={demoUrl} alt={title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects({ portfolio }) {
  const hobbies = portfolio?.projectData || [];

  if (!hobbies.length) return null;

  return (
    <section id="why-work-with-me" className="showcase section">
      <div className="container">
        <div className="showcase__intro">
          <h3>Why Work With Me</h3>
          <h2>Hobbies &amp; Interests</h2>
          <h5>A glimpse into the things I enjoy outside of work</h5>
        </div>

        <Slider {...SLIDER_SETTINGS} infinite={hobbies.length > 1}>
          {hobbies.map((hobby, i) => (
            <HobbySlide key={i} title={hobby.title} description={hobby.description} demoUrl={hobby.demoUrl} />
          ))}
        </Slider>
      </div>
    </section>
  );
}
