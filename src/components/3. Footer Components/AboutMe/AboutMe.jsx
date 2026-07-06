import React from 'react';
import './AboutMe.css';
import ContactMe from '../ContactMe/ContactMe';

const AboutMe = ({ portfolio }) => {
  const { aboutMeText = {}, email = '', phone = '', city = '', emailConfig = {} } = portfolio || {};
  const { infotext = '', power_slogan } = aboutMeText;

  return (
    <section id="AboutMe" className="section About">
      <div className="container">
        <div className="row">

          {/* LEFT SIDE */}
          <div className="col-lg-6 col-md-12 d-flex align-items-center">
            <div className="cta-content">
              <h2 className="wow fadeInUp" data-wow-delay=".2s">About me:</h2>

              <p className="wow fadeInUp" data-wow-delay=".4s">
                <hr />
                {infotext}
                <hr />
              </p>

              {power_slogan && <h2>{power_slogan}</h2>}

              <div className="contact-card">
                <h3>📞 Get in Touch</h3>
                {email && (
                  <div className="contact-item">
                    <span>📧</span>
                    <span>{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="contact-item">
                    <span>📱</span>
                    <span>{phone}</span>
                  </div>
                )}
                {city && (
                  <div className="contact-item">
                    <span>📍</span>
                    <span>{city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-6 col-md-12">
            <div className="contact-sidebar">
              <ContactMe emailConfig={emailConfig} email={email} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutMe;
