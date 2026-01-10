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
import checkComplete from './assets/check-complete.svg';
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

// Posting Date override (Analyze Again workflow)
const [postingDateOverride, setPostingDateOverride] = useState('');
const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState('');
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

  // "What we detected" values (UI only)
  const [detectedPostingAgeValue, setDetectedPostingAgeValue] = useState<string | null>(null);
  const [detectedPostingAgeStatusValue, setDetectedPostingAgeStatusValue] = useState<string | null>(null);
  const [detectedEmployerSourceValue, setDetectedEmployerSourceValue] = useState<string | null>(null);
  const [detectedCanonicalJobIdValue, setDetectedCanonicalJobIdValue] = useState<string | null>(null);

  // Google snippet “What we detected”
  const [detectedGoogleIndexedValue, setDetectedGoogleIndexedValue] = useState<string | null>(null);
  const [detectedGoogleTopResultValue, setDetectedGoogleTopResultValue] = useState<string | null>(null);
  const [detectedGoogleSnippetValue, setDetectedGoogleSnippetValue] = useState<string | null>(null);
  const [detectedGoogleTopLinkValue, setDetectedGoogleTopLinkValue] = useState<string | null>(null);


  // Deep Check CTA focus target
  const jobDescRef = useRef<HTMLTextAreaElement | null>(null);


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

  /* ---------------- ANALYSIS (accordion + cards) ---------------- */

  const [openAnalysis, setOpenAnalysis] = useState<boolean>(true);

  type StepStatus = 'pending' | 'complete';
  type AnalysisStepKey =
    | 'pageLoads'
    | 'postingAgeDetected'
    | 'contentStructureParsed'
    | 'freshnessPatterns'
    | 'recycledLanguageChecks'
    | 'activityIndicatorsScan'
    | 'detectedPostingAge'
    | 'detectedEmployerSource'
    | 'detectedCanonicalJobId'
    | 'detectedActivityScan'
    | 'detectedLastUpdated'
    | 'detectedApplyLinkBehavior'
    | 'confidenceDataQuality'
    | 'scorePostingAge'
    | 'scoreFreshness1'
    | 'scoreContentUniqueness'
    | 'scoreActivityIndicators'
    | 'scoreFreshness2'
    | 'scoreSiteReliability'
    | 'detectedGoogleIndexed'
    | 'detectedGoogleTopResult'
    | 'detectedGoogleSnippet';



  const makeInitialAnalysisSteps = (): Record<AnalysisStepKey, StepStatus> => ({
    pageLoads: 'pending',
    postingAgeDetected: 'pending',
    contentStructureParsed: 'pending',
    freshnessPatterns: 'pending',
    recycledLanguageChecks: 'pending',
    activityIndicatorsScan: 'pending',

    detectedPostingAge: 'pending',
    detectedEmployerSource: 'pending',
    detectedCanonicalJobId: 'pending',
    detectedActivityScan: 'pending',
    detectedLastUpdated: 'pending',
    detectedApplyLinkBehavior: 'pending',

    confidenceDataQuality: 'pending',

    scorePostingAge: 'pending',
    scoreFreshness1: 'pending',
    scoreContentUniqueness: 'pending',
    scoreActivityIndicators: 'pending',
    scoreFreshness2: 'pending',
    scoreSiteReliability: 'pending',

    detectedGoogleIndexed: 'pending',
    detectedGoogleTopResult: 'pending',
    detectedGoogleSnippet: 'pending',


  });

  const [analysisSteps, setAnalysisSteps] = useState<Record<AnalysisStepKey, StepStatus>>(
    makeInitialAnalysisSteps()
  );

  const completeAllAnalysisSteps = () => {
    setAnalysisSteps((prev) => {
      const next = { ...prev };
      (Object.keys(next) as AnalysisStepKey[]).forEach((k) => (next[k] = 'complete'));
      return next;
    });
  };

  const resetAnalysisSteps = () => {
    setAnalysisSteps(makeInitialAnalysisSteps());
  };

  const scheduleStep = (key: AnalysisStepKey, delayMs: number) => {
    const t = window.setTimeout(() => {
      setAnalysisSteps((s) => ({ ...s, [key]: 'complete' }));
    }, delayMs);
    timeoutsRef.current.push(t);
  };


  const timeoutsRef = useRef<number[]>([]);
  const flutterIntervalRef = useRef<number | null>(null);
  const gaugeDurationRef = useRef<number>(1400);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  };

  const stopGaugeFlutter = () => {
    if (flutterIntervalRef.current !== null) {
      window.clearInterval(flutterIntervalRef.current);
      flutterIntervalRef.current = null;
    }
  };

  const startGaugeFlutter = () => {
    stopGaugeFlutter();

    // Slower, calmer flutter while "waiting"
    setGaugeDurationMs(520);

    // Start low, then flutter between 1% and 11%
    setGaugeTarget(1);

    flutterIntervalRef.current = window.setInterval(() => {
      // Random integer in [1, 11]
      const next = 1 + Math.floor(Math.random() * 11);
      setGaugeTarget(next);
      setGaugeRunId((n) => n + 1);
    }, 1100);
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

    const jumpToDeepCheck = () => {
  // We must return to the "idle" UI, because the Deep inputs only render there.
  resetAnalysis();

  // Guide user into the “paste description” path
  setCheckMode('deep');
  setFormError(null);
  setUrl('');
  setJobDescription('');

  // Bring user back to the hero area where the tabs + inputs live
  window.location.hash = '#hero';

  // Wait for React to render the Deep UI, then scroll + focus
  window.setTimeout(() => {
    const el = jobDescRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  }, 150);
};




      const resetAnalysis = () => {
    clearAllTimeouts();
    stopGaugeFlutter();
    setStatus('idle');
setScore(null);
setFormError(null);

// Reset "What we detected" values
setDetectedPostingAgeValue(null);
setDetectedPostingAgeStatusValue(null);
setDetectedEmployerSourceValue(null);
setDetectedCanonicalJobIdValue(null);

setDetectedGoogleIndexedValue(null);
setDetectedGoogleTopResultValue(null);
setDetectedGoogleSnippetValue(null);
setDetectedGoogleTopLinkValue(null);
setPostingDateOverride('');
setLastAnalyzedUrl('');



setSignals({
  stale: 'pending',
  weak: 'pending',
  inactivity: 'pending',
});

// Reset analysis UI
setOpenAnalysis(true);
resetAnalysisSteps();

// Reset gauge to start state
setGaugeTarget(0);
setGaugeDurationMs(1400);
gaugeDurationRef.current = 1400;
setGaugeRunId((n) => n + 1);

  };

  const getResultBucket = (pct: number) => {
    const s = Math.max(5, Math.min(95, Math.round(pct)));

    // 75–95
    if (s >= 75) {
      return { label: 'Very Likely Active Posting', className: 'result-very-active' };
    }

    // 55–74
    if (s >= 55) {
      return { label: 'Likely Active Posting', className: 'result-likely-active' };
    }

    // 40–54  ✅ Use your preferred label
    if (s >= 40) {
      return { label: 'Borderline Freshness', className: 'result-borderline' };
    }

    // 5–39
    return { label: 'Likely Inactive / Ghost Posting', className: 'result-inactive' };
  };


  const handleAnalyze = async (override?: { url?: string; jobDescription?: string; postingDate?: string }) => {
    setFormError(null);

    const urlValue = (override?.url ?? url).trim();
const descValue = (override?.jobDescription ?? jobDescription).trim();
const postingDateValue = (override?.postingDate ?? '').trim();

// Remember the last URL we analyzed (so "Analyze Again" can rerun even if user edits fields)
if (urlValue) setLastAnalyzedUrl(urlValue);

// If this is a normal run (not Analyze Again), clear any old manual date
if (!override?.postingDate) setPostingDateOverride('');


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

// Reset "What we detected" values (new run)
setDetectedPostingAgeValue(null);
setDetectedPostingAgeStatusValue(null);
setDetectedEmployerSourceValue(null);
setDetectedCanonicalJobIdValue(null);
setDetectedGoogleIndexedValue(null);
setDetectedGoogleTopResultValue(null);
setDetectedGoogleSnippetValue(null);
setDetectedGoogleTopLinkValue(null);


setSignals({
  stale: 'pending',
  weak: 'pending',
  inactivity: 'pending',
});


// Start a fresh gauge run + flutter while we wait (1%–34%)
setGaugeTarget(0);
setGaugeDurationMs(1400);
gaugeDurationRef.current = 1400;
setGaugeRunId((n) => n + 1);

startGaugeFlutter();

// Analysis accordion: show + reset + progressive tag reveal
setOpenAnalysis(true);
resetAnalysisSteps();

// Progressive tag reveal timing (subtle “pop on”)
scheduleStep('pageLoads', 220);
scheduleStep('postingAgeDetected', 520);
scheduleStep('contentStructureParsed', 860);
scheduleStep('freshnessPatterns', 1220);
scheduleStep('recycledLanguageChecks', 1600);
scheduleStep('activityIndicatorsScan', 2000);

scheduleStep('detectedPostingAge', 560);
scheduleStep('detectedEmployerSource', 900);
scheduleStep('detectedCanonicalJobId', 1240);
scheduleStep('detectedActivityScan', 1680);
scheduleStep('detectedLastUpdated', 2080);
scheduleStep('detectedApplyLinkBehavior', 2400);

scheduleStep('confidenceDataQuality', 1480);

scheduleStep('scorePostingAge', 1000);
scheduleStep('scoreFreshness1', 1320);
scheduleStep('scoreContentUniqueness', 1640);
scheduleStep('scoreActivityIndicators', 1960);
scheduleStep('scoreFreshness2', 2280);
scheduleStep('scoreSiteReliability', 2600);

scheduleStep('detectedGoogleIndexed', 1100);
scheduleStep('detectedGoogleTopResult', 1500);
scheduleStep('detectedGoogleSnippet', 1900);




    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  mode: checkMode,
  url: urlValue,
  jobDescription: descValue,
  postingDate: postingDateValue,
}),

      });

      // ✅ Stop flutter as soon as we have a response
      stopGaugeFlutter();
      setGaugeDurationMs(gaugeDurationRef.current);

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

      // Fill "What we detected" values:
      // - Prefer API-provided detected fields if present
      // - Otherwise fallback to URL-derived values for Employer/Source + Canonical Job ID
      let fallbackHost: string | null = null;
      let fallbackJobId: string | null = null;

      try {
        if (urlValue) {
          const u = new URL(urlValue);
          fallbackHost = u.hostname || null;

          // Canonical Job ID heuristics (URL-derived)
          const qp = u.searchParams;
          fallbackJobId =
            (qp.get('jk') || qp.get('jobId') || qp.get('job_id') || qp.get('job') || '').trim() || null;

          if (!fallbackJobId) {
            const path = u.pathname || '';
            // last path segment if it looks like an id (number/uuid-ish)
            const last = path.split('/').filter(Boolean).pop() || '';
            if (/^[a-z0-9-]{8,}$/i.test(last)) fallbackJobId = last;
          }
        }
      } catch {}

      setDetectedPostingAgeValue(data?.detected?.postingAge ?? null);
      setDetectedPostingAgeStatusValue(data?.detected?.postingAgeStatus ?? null);
      setDetectedEmployerSourceValue(data?.detected?.employerSource ?? fallbackHost ?? null);
      setDetectedCanonicalJobIdValue(data?.detected?.canonicalJobId ?? fallbackJobId ?? null);


            // Google snippet values (from API if available)
      const g = data?.google;

      if (!g || g.enabled === false) {
        setDetectedGoogleIndexedValue('Not enabled');
        setDetectedGoogleTopResultValue('—');
        setDetectedGoogleSnippetValue('—');
        setDetectedGoogleTopLinkValue(null);
      } else {
        setDetectedGoogleIndexedValue(g.indexed ? 'Indexed' : 'Not found');
        setDetectedGoogleTopResultValue(g.topTitle ?? '—');
        setDetectedGoogleSnippetValue(g.topSnippet ?? '—');
        setDetectedGoogleTopLinkValue(g.topLink ?? null);
      }


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
        completeAllAnalysisSteps();
        setStatus('complete');
      }, maxDelay + 300);
      timeoutsRef.current.push(t4);

    } catch (err) {
      console.error(err);

      // ✅ Stop flutter if the request fails
      stopGaugeFlutter();
      setGaugeDurationMs(gaugeDurationRef.current);

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
  if (status !== 'idle') {
  resetAnalysis();
  setUrl('');
  setJobDescription('');
}

  setUrl('');
  setJobDescription('');
  setFormError(null);
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
  if (status !== 'idle') {
  resetAnalysis();
  setUrl('');
  setJobDescription('');
}

  setUrl('');
  setJobDescription('');
  setFormError(null);
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
        ref={jobDescRef}
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
  ) : score === null ? (
    '—'
  ) : (
    <span className={getResultBucket(score).className}>
      {getResultBucket(score).label}
    </span>
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

            {/* ANALYSIS (accordion like Legal) */}
      {(status !== 'idle' || import.meta.env.DEV) && (

        <section id="analysis" className="analysis">
          <div className="analysis-section">
            <button
              className="analysis-header"
              aria-expanded={openAnalysis}
              onClick={() => setOpenAnalysis((v) => !v)}
            >
              <span className="analysis-toggle">{openAnalysis ? '−' : '+'}</span>
              <h3>Analysis</h3>
            </button>

            {openAnalysis && (
              <div className="analysis-content">
                <div className="analysis-grid">
                  {/* 1) VISIBLE SIGNALS PIPELINE */}
                  <div className="analysis-card">
                    <div className="analysis-card-title">VISIBLE SIGNALS PIPELINE</div>

                    {analysisSteps.pageLoads === 'complete' && (
                      <div className="analysis-tag" data-tip="Basic page load + reachable response.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Page Loads</div>
                          <div className="analysis-tag-value">Complete</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.postingAgeDetected === 'complete' && (
                      <div className="analysis-tag" data-tip="Checks for visible age / posting recency signals.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Posting Age Detected</div>
                          <div className="analysis-tag-value">Complete</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.contentStructureParsed === 'complete' && (
                      <div className="analysis-tag" data-tip="Parses content blocks to confirm page structure.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Content Structure Parsed</div>
                          <div className="analysis-tag-value">Complete</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.freshnessPatterns === 'complete' && (
                      <div className="analysis-tag" data-tip="Looks for freshness cues (updates, timestamps, etc.).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Freshness Patterns</div>
                          <div className="analysis-tag-value">Complete</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.recycledLanguageChecks === 'complete' && (
                      <div className="analysis-tag" data-tip="Checks for common recycled / evergreen phrasing.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Recycled Language Checks</div>
                          <div className="analysis-tag-value">Complete</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.activityIndicatorsScan === 'complete' && (
                      <div className="analysis-tag" data-tip="Scans for activity indicators (apply signals, structure cues).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Activity Indicators Scan</div>
                          <div className="analysis-tag-value">Complete</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2) WHAT WE DETECTED */}
                  <div className="analysis-card">
                    <div className="analysis-card-title">WHAT WE DETECTED</div>

                    {analysisSteps.detectedPostingAge === 'complete' && (
  (detectedPostingAgeStatusValue === 'blocked' ||
   detectedPostingAgeStatusValue === 'js_required') ? (

    <div
      className="analysis-tag postingage-cta"
      data-tip="If available, detects posting age / recency cues."
    >
      <div className="postingage-cta-head">
        <div className="postingage-cta-title">Posting Age</div>
        <div className="postingage-cta-sub">
  {detectedPostingAgeStatusValue === 'js_required'
    ? 'Unavailable (requires JS render)'
    : 'Unavailable (blocked)'}
</div>
      </div>

      <div className="postingage-cta-body">
  Posting age couldn’t be read from this page. If the listing shows an “Opening Date” or “Posted” date,
  enter it below and rerun.
</div>

<div className="postingage-cta-field">
  <div className="postingage-cta-label">Provide Posting Date</div>
  <input
    type="text"
    className="postingage-cta-input"
    placeholder="i.e. 01/09/2026"
    value={postingDateOverride}
    onChange={(e) => setPostingDateOverride(e.target.value)}
  />
</div>

<button
  type="button"
  className="analyze-btn postingage-cta-btn"
  disabled={
    status === 'running' ||
    !postingDateOverride.trim() ||
    !(lastAnalyzedUrl || url).trim()
  }
  aria-disabled={
    status === 'running' ||
    !postingDateOverride.trim() ||
    !(lastAnalyzedUrl || url).trim()
  }
  onClick={() => {
    const rerunUrl = (lastAnalyzedUrl || url).trim();
    const pd = postingDateOverride.trim();
    if (!rerunUrl || !pd || status === 'running') return;
    handleAnalyze({ url: rerunUrl, jobDescription: '', postingDate: pd });
  }}
>
  Analyze Again
</button>

    </div>

  ) : (

    <div className="analysis-tag" data-tip="If available, detects posting age / recency cues.">
      <img src={checkComplete} alt="" className="analysis-tag-icon" />
      <div className="analysis-tag-text">
        <div className="analysis-tag-title">Posting Age</div>
        <div className="analysis-tag-value">{detectedPostingAgeValue ?? '—'}</div>
      </div>
    </div>

  )
)}


                    {analysisSteps.detectedEmployerSource === 'complete' && (
                      <div className="analysis-tag" data-tip="Identifies the site/employer source where possible.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Employer / Source</div>
                          <div className="analysis-tag-value">{detectedEmployerSourceValue ?? '—'}</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.detectedCanonicalJobId === 'complete' && (
                      <div className="analysis-tag" data-tip="Extracts a stable identifier when present (e.g., jk, ID).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Canonical Job ID</div>
                          <div className="analysis-tag-value">{detectedCanonicalJobIdValue ?? '—'}</div>
                        </div>
                      </div>
                    )}

                                        {analysisSteps.detectedGoogleIndexed === 'complete' && (
                      <div className="analysis-tag" data-tip="Checks whether Google currently returns results for this job/source.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Google Index</div>
                          <div className="analysis-tag-value">{detectedGoogleIndexedValue ?? '—'}</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.detectedGoogleTopResult === 'complete' && (
                      detectedGoogleTopLinkValue ? (
                        <a
                          className="analysis-tag analysis-tag-link"
                          href={detectedGoogleTopLinkValue}
                          target="_blank"
                          rel="noreferrer"
                          data-tip="Opens the top Google result in a new tab."
                        >
                          <img src={checkComplete} alt="" className="analysis-tag-icon" />
                          <div className="analysis-tag-text">
                            <div className="analysis-tag-title">Google Top Result</div>
                            <div className="analysis-tag-value analysis-tag-value-link">
                              {detectedGoogleTopResultValue ?? '—'}
                            </div>
                          </div>
                        </a>
                      ) : (
                        <div className="analysis-tag" data-tip="Top Google result (if found).">
                          <img src={checkComplete} alt="" className="analysis-tag-icon" />
                          <div className="analysis-tag-text">
                            <div className="analysis-tag-title">Google Top Result</div>
                            <div className="analysis-tag-value">{detectedGoogleTopResultValue ?? '—'}</div>
                          </div>
                        </div>
                      )
                    )}

                    {analysisSteps.detectedGoogleSnippet === 'complete' && (
                      <div className="analysis-tag" data-tip="Snippet text Google shows for this result (may include age cues).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Google Snippet</div>
                          <div className="analysis-tag-value">{detectedGoogleSnippetValue ?? '—'}</div>
                        </div>
                      </div>
                    )}


                    {analysisSteps.detectedActivityScan === 'complete' && (
                      <div className="analysis-tag" data-tip="Runs activity indicator scan across the page content.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Activity Indicators Scan</div>
                          <div className="analysis-tag-value">Complete</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.detectedLastUpdated === 'complete' && (
                      <div className="analysis-tag" data-tip="Shows when this analysis result was generated.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Last updated</div>
                          <div className="analysis-tag-value">{new Date().toLocaleString()}</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.detectedApplyLinkBehavior === 'complete' && (
                      hasUrl ? (
                        <a
                          className="analysis-tag analysis-tag-link"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          data-tip="Opens the provided job link in a new tab."
                        >
                          <img src={checkComplete} alt="" className="analysis-tag-icon" />
                          <div className="analysis-tag-text">
                            <div className="analysis-tag-title">Apply Link Behavior</div>
                            <div className="analysis-tag-value analysis-tag-value-link">Click Here</div>
                          </div>
                        </a>
                      ) : (
                        <div className="analysis-tag" data-tip="Link behavior available when analyzing a URL.">
                          <img src={checkComplete} alt="" className="analysis-tag-icon" />
                          <div className="analysis-tag-text">
                            <div className="analysis-tag-title">Apply Link Behavior</div>
                            <div className="analysis-tag-value">—</div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* 3) CONFIDENCE */}
                  <div className="analysis-card">
                    <div className="analysis-card-title">CONFIDENCE</div>

                    {analysisSteps.confidenceDataQuality === 'complete' && (
                      <div className="analysis-tag analysis-tag-highlight" data-tip="Confidence reflects input quality and page accessibility.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Data Quality</div>
                          <div className="analysis-tag-value">Medium</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4) SCORE SUMMARY */}
                  <div className="analysis-card">
                    <div className="analysis-card-title">SCORE SUMMARY</div>

                    {analysisSteps.scorePostingAge === 'complete' && (
                      <div className="analysis-tag" data-tip="Posting age / recency signals contribution.">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Posting Age</div>
                          <div className="analysis-tag-value">−25</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreFreshness1 === 'complete' && (
                      <div className="analysis-tag" data-tip="Freshness-related cues (timestamps / updates).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Freshness Indicators</div>
                          <div className="analysis-tag-value">−10</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreContentUniqueness === 'complete' && (
                      <div className="analysis-tag" data-tip="Content uniqueness (non-recycled language cues).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Content Uniqueness</div>
                          <div className="analysis-tag-value">+5</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreActivityIndicators === 'complete' && (
                      <div className="analysis-tag" data-tip="Activity cues (apply / structure / signals).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Activity Indicators</div>
                          <div className="analysis-tag-value">+10</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreFreshness2 === 'complete' && (
                      <div className="analysis-tag" data-tip="Additional freshness cues (secondary pass).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Freshness Indicators</div>
                          <div className="analysis-tag-value">−10</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreSiteReliability === 'complete' && (
                      <div className="analysis-tag" data-tip="Site reliability cues (major platforms vs unknown).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Site Reliability Indicators</div>
                          <div className="analysis-tag-value">+5</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
                <img src={facebookIcon} alt="Facebook" />
              </a>
              <a href="https://www.x.com" target="_blank" rel="noreferrer">
                <img src={twitterIcon} alt="Twitter" />
              </a>
              <a href="https://www.tiktok.com/en/" target="_blank" rel="noreferrer">
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
