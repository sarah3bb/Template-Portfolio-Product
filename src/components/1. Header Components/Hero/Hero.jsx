import React from 'react';
import { name, company, socialProfiles, backgroundImageUrl } from '../../../your_info';
import Navbar from '../Navbar/Navbar';
import Typewriter from '../Typewriter/Typewriter';
import './Hero.css';

const Hero = () => {
  const { firstname, lastname, profileImage } = name;

  const heroStyle = {
    backgroundImage: `url(${backgroundImageUrl})`,
  };

  return (
    <section id='Home' className='hero-area' style={heroStyle}>
      <Navbar />

      <div className='container'>
        <div className='row align-items-center hero-row'>

          {/* LEFT SIDE (TEXT) */}
          <div className='col-lg-6 hero-content text-left'>
            <div className='company-container wow fadeInLeft' data-wow-delay='.3s'>
              <h1 className='company-name'>{company.name}</h1>

              <div className='company-logos'>
                {company.logos.map((logo, index) => (
                  <img src={logo} alt={`company logo ${index + 1}`} key={index} />
                ))}
              </div>
            </div>

            {/* <div className='name-container wow fadeInLeft' data-wow-delay='.4s'>
              <h2>{firstname} {lastname}</h2>
            </div> */}

            <div className='name-container wow fadeInLeft' data-wow-delay='.4s'>
              <h2>{firstname} {lastname}</h2>

              {/* NEW: Contact Info */}
              <div className='contact-info'>
                <p>📧 kokoro.araki1015@gmail.com</p>
                <p>📞 +61 422 547 431</p>
              </div>
            </div>

            <div className='typewriter-container wow fadeInLeft' data-wow-delay='.6s'>
              <Typewriter />
            </div>
          </div>
          {/* RIGHT SIDE (IMAGE) */}
          {/* <div className='col-lg-6 hero-image-container wow fadeInRight' data-wow-delay='.6s'>
            <img src={profileImage} alt="profile" className="hero-image" />
          </div> */}
          <div className='col-lg-6 hero-image-container wow fadeInRight' data-wow-delay='.6s'>
            <img src={profileImage} alt="profile" className="hero-image" />

            <div className='image-socials'>

              {/* Existing socials (LinkedIn) */}
              {socialProfiles.map((profile, index) => (
                <a
                  href={profile.url}
                  id='button'
                  className='btn'
                  key={index}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={profile.name}
                >
                  <i className={`icon ${profile.icon}`}></i>
                </a>
              ))}

              {/* Resume button (same style) */}
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

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;