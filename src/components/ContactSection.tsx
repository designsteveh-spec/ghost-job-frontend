import { useState } from 'react';

const TO_EMAIL = 'designsteveh@gmail.com';

export default function ContactSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

    const canSubmit =
    email.trim().length > 0 &&
    name.trim().length > 0 &&
    title.trim().length > 0 &&
    message.trim().length > 0;


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const subject = `[Ghost Job Checker] ${title}`;
    const body = [
      `From: ${name} <${email}>`,
      `Title: ${title}`,
      '',
      message,
    ].join('\n');

    const mailto = `mailto:${encodeURIComponent(TO_EMAIL)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-inner">
        <h2 className="contact-title">
          Contact the <span className="accent">Ghost Jobs Checker</span> Team
        </h2>

        <form className="contact-form" onSubmit={onSubmit}>
          <div className="contact-field">
            <label>Your Email (Required)</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="contact-field">
            <label>Your Name (Required)</label>
            <input
              type="text"
              placeholder="Enter your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="contact-field">
            <label>Title (Required)</label>
            <select
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            >
              <option value="" disabled>
                Select a title
              </option>
              <option value="General Questions">General Questions</option>
              <option value="Question about purchase">Question about purchase</option>
              <option value="Cancel purchase (must be within 24 hours)">
                Cancel purchase (must be within 24 hours)
              </option>
            </select>
          </div>

          <div className="contact-field">
            <label>Message (Required)</label>
            <textarea
              placeholder="Enter your message here for the Ghost Job Checker team and we’ll get back to you as soon as possible."
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="contact-actions">
            <button
  type="submit"
  className="contact-submit"
  disabled={!canSubmit}
  aria-disabled={!canSubmit}
>
  Send Mail
</button>

          </div>
        </form>
      </div>
    </section>
  );
}
