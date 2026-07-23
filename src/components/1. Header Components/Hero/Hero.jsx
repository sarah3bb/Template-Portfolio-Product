import React from 'react';
import Navbar from '../Navbar/Navbar';
import Typewriter from '../Typewriter/Typewriter';
import './Hero.css';

function CompanyBadge({ name, logos }) {
  if (!name) return null;
  return (
    <div className="hero-identity__company">
      <h1 className="hero-identity__company-name">{name}</h1>
      {logos.length > 0 && (
        <div className="hero-identity__company-logos">
          {logos.map((src, i) => (
            <img key={src + i} src={src} alt={`Company logo ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function SocialButton({ href, icon, label }) {
  return (
    <a href={href} className="hero-portrait__social-btn" target="_blank" rel="noreferrer" aria-label={label}>
      <i className={`hero-portrait__social-icon ${icon}`} />
    </a>
  );
}

export default function Hero({ portfolio }) {
  if (!portfolio) return null;

  const {
    name = {},
    company = {},
    socialProfiles = [],
    backgroundImageUrl = '',
    typeWriterText,
    email = '',
    phone = '',
  } = portfolio;
  const { firstname = '', lastname = '', profileImage = '', url: resumeUrl = '' } = name;

  const sectionStyle = backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : undefined;

  return (
    <section id="Home" className="hero-area" style={sectionStyle}>
      <Navbar />

      <div className="container">
        <div className="row align-items-center hero-row">
          <div className="col-lg-6 hero-identity">
            <CompanyBadge name={company.name} logos={company.logos || []} />

            <div className="hero-identity__name">
              <h2>{firstname} {lastname}</h2>
              {(email || phone) && (
                <div className="hero-identity__contact">
                  {email && <p>{email}</p>}
                  {phone && <p>{phone}</p>}
                </div>
              )}
            </div>

            <div className="hero-identity__typewriter">
              <Typewriter typeWriterText={typeWriterText} />
            </div>
          </div>

          <div className="col-lg-6 hero-portrait">
            {profileImage && <img src={profileImage} alt="Profile" className="hero-portrait__photo" />}

            <div className="hero-portrait__socials">
              {socialProfiles.map((profile, i) => (
                <SocialButton
                  key={profile.url || i}
                  href={profile.url}
                  icon={profile.icon}
                  label={profile.label || profile.name}
                />
              ))}

              {resumeUrl && (
                <a
                  href={resumeUrl}
                  className="hero-portrait__social-btn"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Resume"
                >
                  <i className="hero-portrait__social-icon lni lni-download"> Resume</i>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
