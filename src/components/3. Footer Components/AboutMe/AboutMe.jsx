import React from 'react';
import './AboutMe.css';
import ContactMe from '../ContactMe/ContactMe';
import { aboutMeText } from '../../../your_info';

const AboutMe = () => {
  const { infotext, power_slogan } = aboutMeText;

  return (
    <section id="AboutMe" className="section About">
      <div className="container">
        <div className="row">
          
          {/* LEFT SIDE */}
          <div className="col-lg-6 col-md-12 d-flex align-items-center">
            <div className="cta-content">
              <h2 className="wow fadeInUp" data-wow-delay=".2s">
                About me:
              </h2>

              <p className="wow fadeInUp" data-wow-delay=".4s">
                <hr /> {infotext}
                <hr />
              </p>

              <h2>{power_slogan}</h2>

              {/* 🔥 NEW CONTACT BLOCK */}
              <div className="contact-card">
                <h3>📞 Get in Touch</h3>

                <div className="contact-item">
                  <span>📧</span>
                  <span>kokoro.araki1015@gmail.com</span>
                </div>

                <div className="contact-item">
                  <span>📱</span>
                  <span>+61 422 547 431</span>
                </div>

                <div className="contact-item">
                  <span>📍</span>
                  <span>Melbourne, Australia</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (keep your form if needed) */}
          <div className="col-lg-6 col-md-12">
            <div className="contact-sidebar">
              <ContactMe />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutMe;