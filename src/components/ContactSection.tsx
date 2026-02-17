import { useState } from 'react';

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || 'https://ghostjobs.trusted-tools.com';

export default function ContactSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const canSend =
    email.trim().length > 0 &&
    name.trim().length > 0 &&
    title.trim().length > 0 &&
    message.trim().length > 0;

  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendError, setSendError] = useState<string>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSendState('sending');
    setSendError('');

    try {
      const r = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          title,
          message,
        }),
      });

      const data = await r.json().catch(() => null);

      if (!r.ok || !data?.ok) {
        setSendState('error');
        setSendError(data?.error || 'Message could not be sent. Please try again.');
        return;
      }

      setSendState('sent');

      // Clear fields after send
      setEmail('');
      setName('');
      setTitle('');
      setMessage('');
    } catch {
      setSendState('error');
      setSendError('Network error. Please try again.');
    }
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
    disabled={!canSend || sendState === 'sending'}
    aria-disabled={!canSend || sendState === 'sending'}
  >
    {sendState === 'sending' ? 'Sending…' : sendState === 'sent' ? 'Mail Sent' : 'Send Mail'}
  </button>
</div>

{sendState === 'sent' && (
  <div className="contact-status contact-status-success">Message sent.</div>
)}

{sendState === 'error' && (
  <div className="contact-status contact-status-error">{sendError || 'Message could not be sent.'}</div>
)}

        </form>
      </div>
    </section>
  );
}
