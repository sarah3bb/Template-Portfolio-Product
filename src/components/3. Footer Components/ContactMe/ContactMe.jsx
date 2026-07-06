import React, { useRef, useState } from 'react';
import './ContactMe.css';
import emailjs from 'emailjs-com';

const ContactMe = ({ emailConfig, email }) => {
  const form = useRef();
  const [isMessageSent, setMessageSent] = useState(false);
  const [error, setError] = useState('');

  const { serviceID = '', templateID = '', userID = '' } = emailConfig || {};
  const emailJsConfigured = serviceID && templateID && userID &&
    !serviceID.includes('XXXX') && !templateID.includes('XXXX') && !userID.includes('XXXX');

  const sendEmail = (e) => {
    e.preventDefault();
    setError('');

    emailjs
      .sendForm(serviceID, templateID, form.current, userID)
      .then(() => {
        setMessageSent(true);
        e.target.reset();
      })
      .catch(() => {
        setError('Message failed to send. Please try again or email me directly.');
      });
  };

  // If EmailJS isn't configured, show a mailto fallback
  if (!emailJsConfigured) {
    return (
      <section id='ContactMe'>
        <div className='form-container'>
          <div className='contact-form-wrapper d-flex justify-content-center'>
            <div className='contact-form'>
              <h5 className='title'>Contact Me</h5>
              <p className='description'>Let's work together!</p>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className='submit-button'
                  style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
                >
                  Send me an email
                </a>
              ) : (
                <p style={{ color: '#9ca3af' }}>Contact information coming soon.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id='ContactMe'>
      <div className='form-container wow fadeInRight' data-wow-delay='.4s'>
        <div className='contact-form-wrapper d-flex justify-content-center'>
          <form ref={form} onSubmit={sendEmail} className='contact-form'>
            <h5 className='title'>Contact Me</h5>
            <p className='description'>Let's work together!</p>

            <div>
              <input
                type='text'
                className='form-control rounded border-white mb-3 form-input'
                name='user_name'
                placeholder='Name'
                required
              />
            </div>
            <div>
              <input
                type='email'
                className='form-control rounded border-white mb-3 form-input'
                name='user_email'
                placeholder='Email'
                required
              />
            </div>
            <div>
              <textarea
                className='form-control rounded border-white mb-3 form-text-area'
                name='message'
                rows='5'
                cols='30'
                placeholder='Message'
                required
              ></textarea>
            </div>

            {error && <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}

            <div className='submit-button-wrapper' data-wow-delay='.6s'>
              {!isMessageSent ? (
                <button type='submit' className='submit-button'>Send</button>
              ) : (
                <div className='success-message'>
                  <h4>Message Sent Successfully!</h4>
                  <p>Thank you for contacting me.</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactMe;
