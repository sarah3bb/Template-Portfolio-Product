import React from 'react';
import './Projects.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Projects = ({ portfolio }) => {
  const projectData = portfolio?.projectData || [];

  if (!projectData.length) return null;

  const settings = {
    dots: true,
    infinite: projectData.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section id="why-work-with-me" className="projects section">
      <div className="container">
        <div className="section-title">
          <h3 className="wow zoomIn" data-wow-delay=".2s">Why Work With Me</h3>
          <h2 className="wow fadeInUp" data-wow-delay=".4s">Hobbies & Interests</h2>
          <h5 className="wow fadeInUp" data-wow-delay=".6s">
            A glimpse into the things I enjoy outside of work
          </h5>
        </div>

        <Slider {...settings}>
          {projectData.map((hobby, index) => (
            <div key={index}>
              <div className="card hobby-card">
                <div className="card-content">
                  <div className="card-header">
                    <h5 className="card-title">{hobby.title}</h5>
                    <p className="card-description">{hobby.description}</p>
                  </div>
                  {hobby.demoUrl && (
                    <div className="demo-container hobby-image-container">
                      <img src={hobby.demoUrl} alt={hobby.title} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Projects;
