import React, { useEffect, useState } from 'react';
import './Navbar.css';

const DESKTOP_BREAKPOINT_PX = 992;

const LINKS = [
  { href: '#Experience', label: 'Experience' },
  { href: '#AboutMe', label: 'About Me' },
  { href: '#ContactMe', label: 'Contact Me' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function closeOnDesktop() {
      if (window.innerWidth >= DESKTOP_BREAKPOINT_PX) setOpen(false);
    }
    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  return (
    <>
      <nav className={`navbar navbar-expand-lg site-nav ${open ? 'site-nav--open' : ''}`}>
        <div className="container-fluid">
          <button
            type="button"
            className={`navbar-toggler site-nav__toggle ${open ? 'site-nav__toggle--active' : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`collapse navbar-collapse justify-content-center site-nav__menu ${open ? 'show site-nav__menu--open' : ''}`}>
            <ul className="navbar-nav">
              {LINKS.map(link => (
                <li className="nav-item" key={link.href}>
                  <a href={link.href} className="nav-link site-nav__link" onClick={() => setOpen(false)}>
                    <span className="site-nav__link-text">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      {open && <div className="site-nav__scrim" />}
    </>
  );
}
