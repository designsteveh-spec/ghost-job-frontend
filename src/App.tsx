import { useState, useEffect, useRef } from 'react';

import './index.css';
import Pricing from './components/Pricing';
import MailerLiteForm from './components/MailerLiteForm';
import lockIcon from './assets/lock.svg';


import Navbar from './components/Navbar';
import ActivityGauge from './components/ActivityGauge';



// Hero + education images
import educationImage from './assets/ghostPic-1.png';

// Education icons
import staleIcon from './assets/marker3-data.svg';
import checkOn from './assets/checkmark-on.svg';
import checkOff from './assets/checkmark-off.svg';
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

  const [jobDescription, setJobDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);



  const [openLegal, setOpenLegal] = useState<null | 'terms' | 'privacy'>(null);

  type AnalysisStatus = 'idle' | 'running' | 'complete';
  type SignalStatus = 'pending' | 'complete';

  const [status, setStatus] = useState<AnalysisStatus>('idle');
  // Tier + tab state (UI only for now)
const userTier: 'free' | 'plus' | 'pro' = 'free';

// DEV ONLY: unlock Deep Check while building/testing UI
const DEV_UNLOCK_DEEP = true;
const canUseDeep = userTier !== 'free' || DEV_UNLOCK_DEEP;


type CheckMode = 'basic' | 'deep';
const [checkMode, setCheckMode] = useState<CheckMode>('basic');

  const isDeep = checkMode === 'deep';
  const hasUrl = !!url.trim();
  const hasDesc = !!jobDescription.trim();

  // Analyze rules:
  // - Basic: link only
  // - Deep: link OR description (separate buttons to prevent mismatches)
  const canAnalyzeLinkNow = hasUrl;
  const canAnalyzeDescNow = isDeep && hasDesc;

  // If both are present, show a mismatch warning (should be rare due to auto-clearing)




  const [score, setScore] = useState<number | null>(null);

// Gauge UI (front-end only)
const [gaugeTarget, setGaugeTarget] = useState<number>(0);
const [gaugeDurationMs, setGaugeDurationMs] = useState<number>(1400);
const [gaugeRunId, setGaugeRunId] = useState<number>(0);

  const [signals, setSignals] = useState<{
    stale: SignalStatus;
    weak: SignalStatus;
    inactivity: SignalStatus;
  }>({
    stale: 'pending',
    weak: 'pending',
    inactivity: 'pending',
  });

  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  };


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
	clearAllTimeouts();
    setStatus('idle');
setScore(null);
setFormError(null);
setSignals({
  stale: 'pending',
  weak: 'pending',
  inactivity: 'pending',
});

// Reset gauge to start state
setGaugeTarget(0);
setGaugeDurationMs(1400);
setGaugeRunId((n) => n + 1);

  };


  const handleAnalyze = async (override?: { url?: string; jobDescription?: string }) => {
    setFormError(null);

    const urlValue = (override?.url ?? url).trim();
    const descValue = (override?.jobDescription ?? jobDescription).trim();

    // Basic requires URL
    if (checkMode === 'basic' && !urlValue) {
      setFormError('Paste a job link to run Basic Check.');
      return;
    }

    // Deep requires URL OR Description
    if (checkMode === 'deep' && !urlValue && !descValue) {
      setFormError('Add a job link or paste a job description to run Deep Check.');
      return;
    }

    // Kill any prior timers so tab switching/reset can't be overwritten
    clearAllTimeouts();

    // Reset state
setStatus('running');
setScore(null);
setSignals({
  stale: 'pending',
  weak: 'pending',
  inactivity: 'pending',
});

// Start a fresh gauge run at 0% while we process
setGaugeTarget(0);
setGaugeDurationMs(1400);
setGaugeRunId((n) => n + 1);


    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: checkMode,
          url: urlValue,
          jobDescription: descValue,
        }),
      });

      if (!res.ok) {
        let msg = 'Analyze failed';
        try {
          const errData = await res.json();
          if (errData?.error) msg = errData.error;
        } catch {}
        setFormError(msg);
        setStatus('idle');
        return;
      }

      const data = await res.json();

      const { stale, weak, inactivity } = data.signals;

      const t1 = window.setTimeout(() => {
        setSignals((s) => ({ ...s, stale: 'complete' }));
      }, stale.delay);
      timeoutsRef.current.push(t1);

      const t2 = window.setTimeout(() => {
        setSignals((s) => ({ ...s, weak: 'complete' }));
      }, weak.delay);
      timeoutsRef.current.push(t2);

      const t3 = window.setTimeout(() => {
        setSignals((s) => ({ ...s, inactivity: 'complete' }));
      }, inactivity.delay);
      timeoutsRef.current.push(t3);

      const maxDelay = Math.max(stale.delay, weak.delay, inactivity.delay);

// Drive gauge animation to the final score across the staged signal duration
setGaugeTarget(data.score);
setGaugeDurationMs(maxDelay + 300);


      const t4 = window.setTimeout(() => {
        setScore(data.score);
        setStatus('complete');
      }, maxDelay + 300);
      timeoutsRef.current.push(t4);
    } catch (err) {
      console.error(err);
      setFormError('Network error. Please try again.');
      setStatus('idle');
      setScore(null);
    }
  };


  return (
    <>
      <Navbar />

      {/* HERO */}
      <section id="hero" className="hero">
	  
	 <div className="check-tabs-frame">
  <div className="check-tabs-inner">
    <div className="check-tabs">
      {/* BASIC TAB */}
      <button
        className={`check-tab ${checkMode === 'basic' ? 'active' : ''}`}
        onClick={() => {
  setCheckMode('basic');
  if (status !== 'idle') resetAnalysis();
}}

      >
        Basic Check
      </button>

      {/* DEEP TAB */}
      <button
  className={`check-tab ${checkMode === 'deep' ? 'active' : ''} ${
    !canUseDeep ? 'locked' : ''
  }`}
onClick={() => {
  if (!canUseDeep) return;
  setCheckMode('deep');
  if (status !== 'idle') resetAnalysis();
}}

>
  Deep Check
  {!canUseDeep && <img src={lockIcon} alt="" className="tab-lock-icon" />}
</button>

    </div>
  </div>
</div>
 

	  
        <div className="hero-inner">
        <div className="hero-graphic hero-visual">
  <ActivityGauge
    status={status}
    targetPercent={gaugeTarget}
    durationMs={gaugeDurationMs}
    runId={gaugeRunId}
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
                    placeholder={isDeep ? "Paste job link (or use description below)" : "Copy and paste job link here"}

                    value={url}
                    onChange={(e) => {
  const next = e.target.value;
  setUrl(next);
  if (formError) setFormError(null);

  // Deep rule: if user starts using link, clear description
  if (isDeep && next.trim() && jobDescription.trim()) {
    setJobDescription('');
  }
}}


                  />
                 <button
  className="analyze-btn"
  onClick={() => handleAnalyze()}

  disabled={!canAnalyzeLinkNow || (isDeep && hasDesc)}
  aria-disabled={!canAnalyzeLinkNow || (isDeep && hasDesc)}
>


                    <span className="analyze-desktop">Analyze Job Link</span>
                    <span className="analyze-mobile">Analyze</span>
                  </button>
                </div>
				
				{formError && <p className="form-error">{formError}</p>}


{isDeep && (
  <>
    <div className="deep-block">
      <div className="deep-label-row">
        <div className="deep-label">Job Description (Deep Check)</div>
        <div className="deep-hint">Paste a job description instead of a link.</div>

      </div>

      <textarea
        className="job-desc"
        placeholder="Copy and paste job description here"
        value={jobDescription}
       onChange={(e) => {
  const next = e.target.value;
  setJobDescription(next);
  if (formError) setFormError(null);

  // Deep rule: if user starts using description, clear link
  if (next.trim() && url.trim()) {
    setUrl('');
  }
}}

      />
	  
	  <div className="input-group">
  <button
    className="analyze-btn"
    onClick={() => handleAnalyze({ jobDescription, url: '' })}
    disabled={!canAnalyzeDescNow || hasUrl}
    aria-disabled={!canAnalyzeDescNow || hasUrl}
  >
    <span className="analyze-desktop">Analyze Description</span>
    <span className="analyze-mobile">Analyze</span>
  </button>
</div>

	  
	  
    </div>

    

    
  </>
)}



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
                  <ul className="results-list">
  <li className={signals.stale === 'complete' ? 'done' : 'pending'}>
    <img
      src={signals.stale === 'complete' ? checkOn : checkOff}
      alt=""
      className="result-icon"
    />
    Detects stale or evergreen postings
  </li>

  <li className={signals.weak === 'complete' ? 'done' : 'pending'}>
    <img
      src={signals.weak === 'complete' ? checkOn : checkOff}
      alt=""
      className="result-icon"
    />
    Flags weak or recycled job descriptions
  </li>

  <li className={signals.inactivity === 'complete' ? 'done' : 'pending'}>
    <img
      src={signals.inactivity === 'complete' ? checkOn : checkOff}
      alt=""
      className="result-icon"
    />
    Highlights common inactivity signals
  </li>
</ul>

                </ul>

                <button
                  className="secondary-btn primary-cta"

                  disabled={status === 'running'}
                  aria-disabled={status === 'running'}
                  onClick={() => {
                    if (status === 'running') return;
resetAnalysis();
setUrl('');
setJobDescription('');

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
