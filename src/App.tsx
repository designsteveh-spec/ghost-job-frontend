import { useState, useEffect } from 'react';
import './index.css';
import Pricing from './components/Pricing';
import MailerLiteForm from './components/MailerLiteForm';

import Navbar from './components/Navbar';
import ghostStatic from './assets/ghost-static-gear.jpg';
import ghostAnim from './assets/ghost-anim-gear.gif';


// Hero + education images
import educationImage from './assets/ghostPic-1.png';

// Education icons
import staleIcon from './assets/marker3-data.svg';
import weakIcon from './assets/marker2-abs.svg';
import signalIcon from './assets/marker1-suc.svg';

// Social icons
import facebookIcon from './assets/socialFacebook.svg';
import twitterIcon from './assets/socialTwitter.svg';
import tiktokIcon from './assets/socialTikTok.svg';

export default function App() {
  const API_BASE =
    import.meta.env.VITE_API_BASE || 'https://ghost-job-api.onrender.com';

  const [url, setUrl] = useState('');
  const [openLegal, setOpenLegal] = useState<null | 'terms' | 'privacy'>(null);

  type AnalysisStatus = 'idle' | 'running' | 'complete';
  type SignalStatus = 'pending' | 'complete';

  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [signals, setSignals] = useState<{
    stale: SignalStatus;
    weak: SignalStatus;
    inactivity: SignalStatus;
  }>({
    stale: 'pending',
    weak: 'pending',
    inactivity: 'pending',
  });

  /* -------------------------------------------
     Auto-expand legal sections via anchor links
  -------------------------------------------- */
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'terms' || hash === 'privacy') {
      setOpenLegal(hash);
    }
  }, []);

  const toggleLegal = (section: 'terms' | 'privacy') => {
    setOpenLegal((prev) => (prev === section ? null : section));
  };

  const resetAnalysis = () => {
    setStatus('idle');
    setScore(null);
    setSignals({
      stale: 'pending',
      weak: 'pending',
      inactivity: 'pending',
    });
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    // Reset state
    setStatus('running');
    setScore(null);
    setSignals({
      stale: 'pending',
      weak: 'pending',
      inactivity: 'pending',
    });

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error('Analyze failed');
      }

      const data = await res.json();

      // Trigger signals one-by-one using backend timing
      const { stale, weak, inactivity } = data.signals;

      setTimeout(() => {
        setSignals((s) => ({ ...s, stale: 'complete' }));
      }, stale.delay);

      setTimeout(() => {
        setSignals((s) => ({ ...s, weak: 'complete' }));
      }, weak.delay);

      setTimeout(() => {
        setSignals((s) => ({ ...s, inactivity: 'complete' }));
      }, inactivity.delay);

      // Mark analysis complete after last signal
      const maxDelay = Math.max(stale.delay, weak.delay, inactivity.delay);

      setTimeout(() => {
        setScore(data.score);
        setStatus('complete');
      }, maxDelay + 300);
    } catch (err) {
      console.error(err);
      setStatus('complete');
      setScore(null);
    }
  };

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section id="hero" className="hero">
        <div className="hero-inner">
          <div className="hero-graphic hero-visual">
  <img
    src={status !== 'running' ? ghostAnim : ghostStatic}
    alt="Job posting analysis illustration"
    className="hero-graphic-img"
  />
</div>


          <div className="hero-content">
            {status === 'idle' ? (
              <>
                <span className="eyebrow">Ghost Job Link Checker</span>

                <h1>
                  Use probability indicators to assess{' '}
                  <span className="accent">job posting activity</span>
                </h1>

                <p className="subtitle">
                  Paste any public job posting link to receive a
                  probability-based assessment using observable signals. This
                  tool provides insight — not accusations — to help you decide
                  where to focus your time.
                </p>

                <div className="input-group">
                  <input
                    type="url"
                    placeholder="Copy and paste job link here"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <button className="analyze-btn" onClick={handleAnalyze}>
                    <span className="analyze-desktop">Analyze Job Link</span>
                    <span className="analyze-mobile">Analyze</span>
                  </button>
                </div>

                <p className="microcopy muted">
                  Works on any public job posting. No account required.
                </p>
              </>
            ) : (
              <>
               <h2>
  Results:{' '}
  {status === 'running' ? (
    'In Progress'
  ) : (
    <span className="result-active">Likely Active Posting</span>
  )}
</h2>


                <p>
                  Probability Score:{' '}
                  {score === null ? '—' : <strong>{score}%</strong>}
                </p>

                <p>
                  Checking posting freshness, content patterns, and activity
                  signals:{' '}
                  <strong>
                    {status === 'running' ? 'In Progress' : 'Complete'}
                  </strong>
                </p>

                <ul className="results-list">
                  <li
                    className={
                      signals.stale === 'complete' ? 'done' : 'pending'
                    }
                  >
                    Detects stale or evergreen postings
                  </li>
                  <li
                    className={signals.weak === 'complete' ? 'done' : 'pending'}
                  >
                    Flags weak or recycled job descriptions
                  </li>
                  <li
                    className={
                      signals.inactivity === 'complete' ? 'done' : 'pending'
                    }
                  >
                    Highlights common inactivity signals
                  </li>
                </ul>

                <button
                  className="secondary-btn primary-cta"

                  disabled={status === 'running'}
                  aria-disabled={status === 'running'}
                  onClick={() => {
                    if (status === 'running') return;
                    resetAnalysis();
                    setUrl('');
                  }}
                >
                  Check Another Link
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section className="education">
        <div className="education-inner">
          <div className="education-content">
            <h2>
              Why <span className="accent">ghost jobs</span> matter
            </h2>

            <p className="education-text">
              Some job postings remain open long after hiring has paused. Others
              are used to collect resumes without an active role behind them.
              This tool helps you recognize those patterns before you invest
              time.
            </p>

            <ul className="education-list">
              <li>
                <img src={staleIcon} alt="" />
                <span>Detects stale or evergreen postings</span>
              </li>

              <li>
                <img src={weakIcon} alt="" />
                <span>Flags weak or recycled job descriptions</span>
              </li>

              <li>
                <img src={signalIcon} alt="" />
                <span>Highlights common inactivity signals</span>
              </li>
            </ul>
          </div>

          <div className="education-media">
            <img
              src={educationImage}
              alt="Person reviewing job listings"
              className="education-photo"
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <Pricing />

      {/* NEWSLETTER */}
      <MailerLiteForm />

      {/* LEGAL SECTIONS */}
      <section id="legal" className="legal">
        {/* TERMS */}
        <div id="terms" className="legal-section">
          <button
            className="legal-header"
            aria-expanded={openLegal === 'terms'}
            onClick={() => toggleLegal('terms')}
          >
            <span className="legal-toggle">
              {openLegal === 'terms' ? '−' : '+'}
            </span>
            <h3>Terms of Service</h3>
          </button>

          {openLegal === 'terms' && (
            <div className="legal-content">
              <p>
                Ghost Job Checker provides probability-based assessments derived
                from observable signals. Results are informational only and do
                not constitute legal, hiring, or employment advice.
              </p>

              <p>
                The tool does not verify employer intent, guarantee job
                availability, or make claims about organizations or listings.
              </p>

              <p>
                By using this service, you acknowledge that usage is at your own
                discretion and risk.
              </p>
            </div>
          )}
        </div>

        {/* PRIVACY */}
        <div id="privacy" className="legal-section">
          <button
            className="legal-header"
            aria-expanded={openLegal === 'privacy'}
            onClick={() => toggleLegal('privacy')}
          >
            <span className="legal-toggle">
              {openLegal === 'privacy' ? '−' : '+'}
            </span>
            <h3>Privacy Policy</h3>
          </button>

          {openLegal === 'privacy' && (
            <div className="legal-content">
              <p>
                Ghost Job Checker does not require user accounts to perform free
                checks. Usage limits may be enforced via cookies or anonymous
                identifiers.
              </p>

              <p>
                Email addresses may be collected for optional newsletters or
                upgrades. Personal information is not sold.
              </p>

              <p>
                Payments are processed by third-party providers such as Stripe
                and are subject to their privacy policies.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="footer-brand">Ghost Job Checker</div>
            <p className="footer-note">
              All results are probability-based assessments using observable
              signals.
            </p>

            <div className="footer-socials">
              <a href="https://www.facebook.com" target="_blank">
                <img src={facebookIcon} alt="Facebook" />
              </a>
              <a href="https://www.x.com" target="_blank">
                <img src={twitterIcon} alt="Twitter" />
              </a>
              <a href="https://www.tiktok.com/en/" target="_blank">
                <img src={tiktokIcon} alt="TikTok" />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <a href="#hero">Home</a>
            <a href="#hero">Run Free Check Now</a>
            <a href="#pricing">Upgrade to Plus</a>
            <a href="#pricing">Upgrade to Pro</a>
          </div>

          <div className="footer-col">
            <span>We aim to meet WCAG 2.1 AA guidelines.</span>
            <a href="#terms" onClick={() => setOpenLegal('terms')}>
              Terms of Service
            </a>
            <a href="#privacy" onClick={() => setOpenLegal('privacy')}>
              Privacy Policy
            </a>
          </div>
        </div>

        <div className="footer-bottom">© 2026 Ghost Job Checker</div>
      </footer>
    </>
  );
}
