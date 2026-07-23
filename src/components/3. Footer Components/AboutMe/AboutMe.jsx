import React from 'react';
import ContactMe from '../ContactMe/ContactMe';
import './AboutMe.css';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="bio-card__info-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function AboutMe({ portfolio }) {
  const {
    aboutMeText = {},
    email = '',
    phone = '',
    city = '',
    emailConfig = {},
  } = portfolio || {};
  const { infotext = '', power_slogan: slogan } = aboutMeText;

  return (
    <section id="AboutMe" className="section bio">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-md-12 d-flex align-items-center">
            <div className="bio-copy">
              <h2>About me:</h2>
              <p>
                <hr />
                {infotext}
                <hr />
              </p>
              {slogan && <h2>{slogan}</h2>}

              <div className="bio-card">
                <h3 className="bio-card__title">Get in Touch</h3>
                <InfoRow label="Email" value={email} />
                <InfoRow label="Phone" value={phone} />
                <InfoRow label="Location" value={city} />
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-md-12">
            <div className="bio-contact-panel">
              <ContactMe emailConfig={emailConfig} email={email} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
