import React, { useRef, useState } from 'react';
import emailjs from 'emailjs-com';
import './ContactMe.css';

const PLACEHOLDER_TOKEN = 'XXXX';

function isEmailJsConfigured({ serviceID, templateID, userID }) {
  return Boolean(
    serviceID && templateID && userID &&
    ![serviceID, templateID, userID].some(id => id.includes(PLACEHOLDER_TOKEN))
  );
}

/** Sends the given form element via EmailJS, tracking status for the caller. */
function useEmailJsForm({ serviceID, templateID, userID }) {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  function submit(formEl) {
    setStatus('sending');
    emailjs.sendForm(serviceID, templateID, formEl, userID)
      .then(() => {
        setStatus('sent');
        formEl.reset();
      })
      .catch(() => setStatus('error'));
  }

  return { status, submit };
}

function MailtoFallback({ email }) {
  return (
    <div className="contact-card__body">
      <h5 className="contact-card__title">Contact Me</h5>
      <p className="contact-card__subtitle">Let&apos;s work together!</p>
      {email ? (
        <a href={`mailto:${email}`} className="contact-card__submit contact-card__submit--link">
          Send me an email
        </a>
      ) : (
        <p className="contact-card__empty-note">Contact information coming soon.</p>
      )}
    </div>
  );
}

export default function ContactMe({ emailConfig, email }) {
  const formRef = useRef(null);
  const config = emailConfig || {};
  const configured = isEmailJsConfigured(config);
  const { status, submit } = useEmailJsForm(config);

  function handleSubmit(e) {
    e.preventDefault();
    submit(e.target);
  }

  return (
    <section id="ContactMe">
      <div className="contact-card">
        <div className="contact-card__frame">
          {!configured ? (
            <MailtoFallback email={email} />
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="contact-card__body">
              <h5 className="contact-card__title">Contact Me</h5>
              <p className="contact-card__subtitle">Let&apos;s work together!</p>

              <input type="text" name="user_name" placeholder="Name" className="contact-card__field" required />
              <input type="email" name="user_email" placeholder="Email" className="contact-card__field" required />
              <textarea name="message" rows="5" placeholder="Message" className="contact-card__field contact-card__field--area" required />

              {status === 'error' && (
                <p className="contact-card__error">Message failed to send. Please try again or email me directly.</p>
              )}

              {status === 'sent' ? (
                <div className="contact-card__success">
                  <h4>Message Sent Successfully!</h4>
                  <p>Thank you for contacting me.</p>
                </div>
              ) : (
                <button type="submit" className="contact-card__submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send'}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
