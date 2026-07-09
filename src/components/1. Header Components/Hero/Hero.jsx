import React from 'react';
import Navbar from '../Navbar/Navbar';
import Typewriter from '../Typewriter/Typewriter';
import './Hero.css';

const Hero = ({ portfolio }) => {
  if (!portfolio) return null;
  const { name = {}, company = {}, socialProfiles = [], backgroundImageUrl = '' } = portfolio;
  const { firstname = '', lastname = '', profileImage = '' } = name;

  const heroStyle = backgroundImageUrl
    ? { backgroundImage: `url(${backgroundImageUrl})` }
    : {};

  return (
    <section id='Home' className='hero-area' style={heroStyle}>
      <Navbar portfolio={portfolio} />

      <div className='container'>
        <div className='row align-items-center hero-row'>

          {/* LEFT SIDE (TEXT) */}
          <div className='col-lg-6 hero-content text-left'>
            {company.name && (
              <div className='company-container wow fadeInLeft' data-wow-delay='.3s'>
                <h1 className='company-name'>{company.name}</h1>
                {company.logos && company.logos.length > 0 && (
                  <div className='company-logos'>
                    {company.logos.map((logo, index) => (
                      <img src={logo} alt={`company logo ${index + 1}`} key={index} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className='name-container wow fadeInLeft' data-wow-delay='.4s'>
              <h2>{firstname} {lastname}</h2>
              <div className='contact-info'>
                {portfolio.email && <p>{portfolio.email}</p>}
                {portfolio.phone && <p>{portfolio.phone}</p>}
              </div>
            </div>

            <div className='typewriter-container wow fadeInLeft' data-wow-delay='.6s'>
              <Typewriter typeWriterText={portfolio.typeWriterText} />
            </div>
          </div>

          {/* RIGHT SIDE (IMAGE) */}
          <div className='col-lg-6 hero-image-container wow fadeInRight' data-wow-delay='.6s'>
            {profileImage && (
              <img src={profileImage} alt="profile" className="hero-image" />
            )}

            <div className='image-socials'>
              {(socialProfiles || []).map((profile, index) => (
                <a
                  href={profile.url}
                  id='button'
                  className='btn'
                  key={index}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={profile.label || profile.name}
                >
                  <i className={`icon ${profile.icon}`}></i>
                </a>
              ))}

              {name.url && (
                <a
                  href={name.url}
                  id='button'
                  className='btn'
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Resume"
                >
                  <i className="lni lni-download"> Resume</i>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
