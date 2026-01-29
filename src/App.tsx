import { useState, useEffect, useRef } from 'react';


import './index.css';
import Pricing from './components/Pricing';
import MailerLiteForm from './components/MailerLiteForm';


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

const API_BASE = (import.meta.env.VITE_API_BASE || '').trim();

const WARMUP_TOTAL_MS = 45000;      // total time we’re willing to wait for Render to wake
const WARMUP_PING_TIMEOUT_MS = 4000; // each ping attempt timeout
const WARMUP_RETRY_DELAY_MS = 2500;

async function ensureApiAwake(): Promise<boolean> {
  const started = Date.now();

  while (Date.now() - started < WARMUP_TOTAL_MS) {
    try {
      const c = new AbortController();
      const t = window.setTimeout(() => c.abort(), WARMUP_PING_TIMEOUT_MS);

      // Any response (even 404) means the server is awake.
      await fetch(`${API_BASE}/api/health`, {
        method: 'GET',
        signal: c.signal,
        cache: 'no-store',
      });

      window.clearTimeout(t);
      return true;
    } catch {
      // keep trying
      await new Promise((r) => setTimeout(r, WARMUP_RETRY_DELAY_MS));
    }
  }

  return false;
}



function safeDecodePlanFromAccessCode(code: string): { plan: 'casual' | 'active'; exp?: number } | null {
  try {
    const parts = (code || '').trim().split('.');
    if (parts.length < 2) return null;

    // JWT payload is the 2nd segment
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');

    const json = JSON.parse(atob(payload));

    const rawPlan = String(json?.plan || json?.tier || '').toLowerCase();
    const plan: 'casual' | 'active' = rawPlan === 'active' ? 'active' : 'casual';

    const exp = Number(json?.exp || 0) || undefined;

    return { plan, exp };
  } catch {
    return null;
  }
}

export default function App() {
  useEffect(() => {
  // Warm up API (Render may cold-start after inactivity)
  fetch(`${API_BASE}/api/health`).catch(() => {});
}, []);


  const path = window.location.pathname || '/';
  const isCasualRoute = path === '/casual';
  const isActiveRoute = path === '/active';
  const isPaidRoute = isCasualRoute || isActiveRoute;

  const [accessCode, setAccessCode] = useState('');
  const [showPassUnlocked, setShowPassUnlocked] = useState(false);
  const [unlockedPlanLabel, setUnlockedPlanLabel] = useState<'Casual' | 'Active'>('Casual');

  const [url, setUrl] = useState('');


  const [jobDescription, setJobDescription] = useState('');



  
// Posting Age selection (required)
const [postingDateOverride, setPostingDateOverride] = useState('');
const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState('');


  const [formError, setFormError] = useState<string | null>(null);
  const [_entitlement, setEntitlement] = useState<{ plan: string; exp: number } | null>(null);





  const [openLegal, setOpenLegal] = useState<null | 'terms' | 'refund' | 'privacy'>(null);

  type AnalysisStatus = 'idle' | 'running' | 'complete';
  type SignalStatus = 'pending' | 'complete';

  const [status, setStatus] = useState<AnalysisStatus>('idle');





  
  const hasUrl = !!url.trim();




  // Analyze rules (Unified):
  // - Link is required
  // - Posting Age is optional (used if provided)
  // - Description is optional


  const decodedAccess = safeDecodePlanFromAccessCode(accessCode.trim());
const isAccessExpired =
  !!decodedAccess?.exp && decodedAccess.exp * 1000 <= Date.now();

const canAnalyzeNow =
  hasUrl &&
  (!isPaidRoute || (!!accessCode.trim() && !isAccessExpired));






  // If both are present, show a mismatch warning (should be rare due to auto-clearing)




    const [score, setScore] = useState<number | null>(null);

// Score Breakdown (from backend)
const [scoreBreakdown, setScoreBreakdown] = useState<{
  postingAge?: number;
  freshness1?: number;
  contentUniqueness?: number;
  activityIndicators?: number;
  freshness2?: number;
  siteReliability?: number;
} | null>(null);


  // "What we detected" values (UI only)
  const [detectedPostingAgeValue, setDetectedPostingAgeValue] = useState<string | null>(null);
  // (removed) detectedPostingAgeStatusValue — unused (TS6133)
  const [detectedEmployerSourceValue, setDetectedEmployerSourceValue] = useState<string | null>(null);
  const [detectedCanonicalJobIdValue, setDetectedCanonicalJobIdValue] = useState<string | null>(null);

  // Google snippet “What we detected”
  const [detectedGoogleIndexedValue, setDetectedGoogleIndexedValue] = useState<string | null>(null);
  const [detectedGoogleTopResultValue, setDetectedGoogleTopResultValue] = useState<string | null>(null);
  const [detectedGoogleSnippetValue, setDetectedGoogleSnippetValue] = useState<string | null>(null);
  const [detectedGoogleTopLinkValue, setDetectedGoogleTopLinkValue] = useState<string | null>(null);

const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);











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

  const rollingTextIntervalRef = useRef<number | null>(null);
  const lastRollingTextRef = useRef<string>('');

  const [rollingLine, setRollingLine] = useState<string>('');

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

  const stopRollingText = () => {
    if (rollingTextIntervalRef.current !== null) {
      window.clearInterval(rollingTextIntervalRef.current);
      rollingTextIntervalRef.current = null;
    }
    lastRollingTextRef.current = '';
    setRollingLine('');
  };


  useEffect(() => {
  return () => {
    clearAllTimeouts();
    stopGaugeFlutter();
    stopRollingText();
  };
}, []);



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
  // Only run while we are waiting
  if (status !== 'running') {
    stopRollingText();
    return;
  }

  const lines = [
    'Checking posting freshness…',
    'Scanning content patterns…',
    'Looking for apply link signals…',
    'Detecting stale / evergreen cues…',
    'Checking structure + metadata…',
    'Cross-checking visible indicators…',
    'Scoring confidence signals…',


    'Finalizing probability score…',
  ];

  const pick = () => {
    let next = lines[Math.floor(Math.random() * lines.length)];
    if (lines.length > 1 && next === lastRollingTextRef.current) {
      next = lines[(lines.indexOf(next) + 1) % lines.length];
    }
    lastRollingTextRef.current = next;
    setRollingLine(next);
  };

  pick(); // immediate first line
  rollingTextIntervalRef.current = window.setInterval(pick, 900);

  return () => stopRollingText();
}, [status, score]);


  useEffect(() => {
  // Stripe success flow:
  // If we have ?paid=1&session_id=..., mint an access code and redirect to /casual?code=... or /active?code=...
  const params = new URLSearchParams(window.location.search);
  const paid = (params.get('paid') || '').trim();
  const sessionId = (params.get('session_id') || '').trim();

  if (paid === '1' && sessionId) {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/access/mint?session_id=${encodeURIComponent(sessionId)}`);
        const data = await r.json().catch(() => null);

        if (!r.ok || !data?.code || !data?.plan) {
          setFormError(data?.error || 'Could not activate your pass. Please contact support@trusted-tools.com.');
          return;
        }

        // Persist code
        setAccessCode(String(data.code));
        localStorage.setItem('gj_access_code', String(data.code));
        setEntitlement({ plan: String(data.plan), exp: Number(data.exp || 0) });

        // Redirect to plan route with code in URL, and remove session_id from the address bar
        const planPath = String(data.plan).toLowerCase() === 'active' ? '/active' : '/casual';
        window.location.replace(`${planPath}?code=${encodeURIComponent(String(data.code))}&welcome=1`);
      } catch {
        setFormError('Could not activate your pass due to a network error. Please retry or contact support@trusted-tools.com.');
      }
    })();

    // Important: stop here so the rest of the effect doesn't run during mint/redirect
    return;
  }

  // Paid pass: capture code from URL (?code=...) and persist it
  const codeFromUrl = (params.get('code') || '').trim();
  const stored = (localStorage.getItem('gj_access_code') || '').trim();
  const next = codeFromUrl || stored;

  if (next) {
    setAccessCode(next);
    localStorage.setItem('gj_access_code', next);
  }

  // ✅ Stripe return clarity: show "Pass Unlocked" modal once, then clean URL
  const welcome = (params.get('welcome') || '').trim();
  if (welcome === '1') {
    const decoded = safeDecodePlanFromAccessCode(next);
    const planLabel: 'Casual' | 'Active' = decoded?.plan === 'active' ? 'Active' : 'Casual';
    setUnlockedPlanLabel(planLabel);
    setShowPassUnlocked(true);

    // Remove welcome=1 (keep code=... if present)
    const cleaned = new URL(window.location.href);
    cleaned.searchParams.delete('welcome');
    window.history.replaceState({}, '', cleaned.pathname + cleaned.search + cleaned.hash);
  }

  // Legal hash auto-expand
  const hash = window.location.hash.replace('#', '');
  if (hash === 'terms' || hash === 'refund' || hash === 'privacy') {
    setOpenLegal(hash);
  }
  }, []);

  useEffect(() => {
    if (!showPassUnlocked) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPassUnlocked(false);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showPassUnlocked]);





  // Auto-scroll to Analysis summary AFTER results are complete (prevents early jump/flash)
  
  






  // (Removed) Early scroll during "running" caused flash; handled by post-complete auto-scroll above.


  const toggleLegal = (section: 'terms' | 'refund' | 'privacy') => {
    setOpenLegal((prev) => (prev === section ? null : section));
  };

    




      const resetAnalysis = () => {
    clearAllTimeouts();
    stopGaugeFlutter();
    stopRollingText();
    setStatus('idle');
setScore(null);
setScoreBreakdown(null);

setFormError(null);

// Reset "What we detected" values
setDetectedPostingAgeValue(null);
// (removed) detectedPostingAgeStatusValue reset — unused


setDetectedEmployerSourceValue(null);
setDetectedCanonicalJobIdValue(null);

setDetectedGoogleIndexedValue(null);
setDetectedGoogleTopResultValue(null);
setDetectedGoogleSnippetValue(null);
setDetectedGoogleTopLinkValue(null);
setLastUpdatedAt(null);

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


  // Posting Age dropdown: convert selected range → midpoint ISO date (YYYY-MM-DD)

const postingAgeLabel = (rangeKey: string): string => {
  const labels: Record<string, string> = {
    '': '—',
    skip: 'Not listed / I don’t know',
    today_yesterday: 'Today / yesterday',
    last_3_days: 'Within the last 3 days',
    within_week: '4–7 days ago (within a week)',
    weeks_1_2: '1–2 weeks ago',
    weeks_2_4: '2–4 weeks ago',
    months_1_2: '1–2 months ago',
    months_2_3: '2–3 months ago',
    months_3_6: '3–6 months ago',
    months_6_12: '6–12 months ago',
    over_1_year: 'Over 1 year ago',
  };
  return labels[rangeKey] ?? rangeKey;
};


    const postingAgeRangeToIsoDate = (rangeKey: string): string => {
    if (!rangeKey || rangeKey === 'skip') return '';



    const map: Record<string, number> = {
      today_yesterday: 1,
      last_3_days: 2,
      within_week: 5,      // 4–7 days midpoint
      weeks_1_2: 10,
      weeks_2_4: 21,
      months_1_2: 45,
      months_2_3: 75,
      months_3_6: 135,
      months_6_12: 270,
      over_1_year: 540,
    };

    const days = map[rangeKey];
    if (!days) return '';

    const d = new Date();
    d.setDate(d.getDate() - days);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };


  const handleAnalyze = async (override?: { url?: string; jobDescription?: string; postingDate?: string }) => {
    setFormError(null);

    const urlValue = (override?.url ?? url).trim();

    if (isPaidRoute) {
  const decoded = safeDecodePlanFromAccessCode(accessCode.trim());
  if (decoded?.exp && decoded.exp * 1000 <= Date.now()) {
    setFormError('This pass has expired. Please purchase a new pass or paste a valid access code.');
    setStatus('idle');
    return;
  }
}


const descValue = (override?.jobDescription ?? jobDescription).trim();

const postingAgeRangeKey = (override?.postingDate ?? postingDateOverride ?? '').trim();

// Convert the selected range into a concrete ISO date (YYYY-MM-DD) midpoint.
// If an ISO date is ever passed in directly, allow it.
const postingDateValue =
  postingAgeRangeKey && /^\d{4}-\d{2}-\d{2}$/.test(postingAgeRangeKey)
    ? postingAgeRangeKey
    : postingAgeRangeToIsoDate(postingAgeRangeKey);



// Keep manual posting date unless this call explicitly overrides it (Analyze Again sets it)
if (override?.postingDate !== undefined) setPostingDateOverride(override.postingDate);


    // Unified validation (Link + Posting Age required, Description optional)
    if (!urlValue) {
  setFormError('Paste a job link to analyze.');
  return;
}

setLastAnalyzedUrl(urlValue);


    







    // Kill any prior timers so tab switching/reset can't be overwritten
    clearAllTimeouts();


    // Reset state
setStatus('running');
setScore(null);
setScoreBreakdown(null);


// Reset "What we detected" values (new run)
setDetectedPostingAgeValue(null);
// (removed) detectedPostingAgeStatusValue — unused

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
      // Wake the API (Render cold start) + then run analyze.
// If it aborts, warm again and retry once.
await ensureApiAwake();

const makeRequest = async () => {
  const controller = new AbortController();
  const REQUEST_TIMEOUT_MS = 65000; // give Render enough time to wake + run
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: descValue ? 'deep' : 'basic',
        url: urlValue,
        jobDescription: descValue,
        ...(postingAgeRangeKey
          ? { postingDate: postingAgeRangeKey === 'skip' ? 'skip' : postingDateValue }
          : {}),
        ...(accessCode.trim() ? { accessCode: accessCode.trim() } : {}),
      }),
    });

    return res;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

let res: Response;

try {
  res = await makeRequest();
} catch (e: any) {
  const isAbort = e?.name === 'AbortError' || String(e).includes('AbortError');

  if (!isAbort) throw e;

  // Retry once after another warm attempt
  await ensureApiAwake();
  res = await makeRequest();
}




      // ✅ Stop flutter as soon as we have a response
      stopGaugeFlutter();
      setGaugeDurationMs(gaugeDurationRef.current);

            if (!res.ok) {
        let msg = `Analyze failed (HTTP ${res.status})`;

        try {
          const errData = await res.json();
          if (errData?.error) msg = errData.error;
        } catch {}

        // Friendly known cases
        if (res.status === 413) {
          msg = 'File too large. Please upload a smaller image/PDF (max 6 MB).';
        }

        setFormError(msg);
        setStatus('idle');
        return;
      }


            const data = await res.json();
setScoreBreakdown(data?.breakdown ?? null);
setLastUpdatedAt(new Date().toLocaleString());



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
     // (removed) detectedPostingAgeStatusValue — unused

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
  // 1) Set the score first so the UI can render the number
  setScore(data.score);
  completeAllAnalysisSteps();

  // 2) Flip to "complete" on the next tick, so auto-scroll cannot fire while score is still "—"
  const t4b = window.setTimeout(() => {
    setStatus('complete');
  }, 0);

  timeoutsRef.current.push(t4b);
}, maxDelay + 300);
timeoutsRef.current.push(t4);


    } catch (err) {
      console.error(err);

      // ✅ Stop flutter if the request fails
      stopGaugeFlutter();
      setGaugeDurationMs(gaugeDurationRef.current);

      const name = (err as any)?.name;
      if (name === 'AbortError') {
        setFormError('Request timed out. If this is your first check in a while, the server may be waking up — wait 10 seconds and retry.');

      } else {
        setFormError('Network error. Please try again.');
      }

      setStatus('idle');
      setScore(null);
    }
  };


  return (
    <>
      <Navbar
  isPaidRoute={isPaidRoute}
  accessCode={accessCode}
  onAccessCodeChange={(next: string) => {
    setAccessCode(next);
    localStorage.setItem('gj_access_code', next);
  }}
  onAccessCodeSubmit={(raw: string) => {
    const code = (raw || '').trim();
    if (!code) return;

    // Persist
    setAccessCode(code);
    localStorage.setItem('gj_access_code', code);

    // Route based on the code contents (no API call needed)
    const decoded = safeDecodePlanFromAccessCode(code);
    const planPath = decoded?.plan === 'active' ? '/active' : '/casual';

    // Move them to the correct paid page immediately
    window.location.assign(`${planPath}?code=${encodeURIComponent(code)}`);
  }}
/>


      {showPassUnlocked && (
        <div
          className="pass-unlocked-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Pass unlocked"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowPassUnlocked(false);
          }}
        >
          <div className="pass-unlocked-modal">
            <div className="pass-unlocked-title">
              <span className="pass-unlocked-plan">{unlockedPlanLabel} Pass</span>{' '}
              <span className="pass-unlocked-word">Unlocked</span>
            </div>

            <div className="pass-unlocked-subtitle">Thank you for your purchase.</div>

            <div className="pass-unlocked-body">
              Ghost Job Link is now active for you to use for 30 days.
            </div>

            <div className="pass-unlocked-note">
              <strong>NOTE:</strong> Please save the unique access code we just emailed you.
              If you ever switch devices, paste it into the Access Code field in the top-right
              corner to unlock your pass again.
            </div>

            <button
              className="pass-unlocked-btn"
              onClick={() => setShowPassUnlocked(false)}
            >
              Start Checking Jobs
            </button>
          </div>
        </div>
      )}


      {/* HERO */}
      <section id="hero" className="hero">
	  
	 

 

	  
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
  Stop wasting time applying to ghost jobs with our{' '}
  <span className="accent">link checking tool</span>.
</h1>


                              <p className="subtitle">
  Paste any public job posting link to receive a probability-based assessment using observable signals.
  This tool provides insight — not accusations — to help you decide where to focus your time.
</p>

<div className="unified-form">
  <div className="unified-row">
    <div className="unified-main">
      <div className="field-label">Post Job Link (Required)</div>

      <div className="input-group">
        <input
          type="url"
          placeholder="Paste job link"
          value={url}
          onChange={(e) => {
            const next = e.target.value;
            setUrl(next);
            if (formError) setFormError(null);
          }}
        />

        <button
          className="analyze-btn"
          onClick={() => handleAnalyze()}
          disabled={!canAnalyzeNow}
          aria-disabled={!canAnalyzeNow}
        >
          <span className="analyze-desktop">Analyze Job</span>
          <span className="analyze-mobile">Analyze</span>
        </button>
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <div className="field-label" style={{ marginTop: 14 }}>
        Select Posting Age (Optional)
      </div>

      <select
        className={`postingage-cta-input ${!postingDateOverride ? 'postingage-cta-select-placeholder' : ''}`}
        value={postingDateOverride}
        onChange={(e) => {
          setPostingDateOverride(e.target.value);
          if (formError) setFormError(null);
        }}
      >
        <option value="">Select a posting age</option>
<option value="skip">Not listed / I don’t know</option>


        <option value="today_yesterday">Today / yesterday</option>
        <option value="last_3_days">Within the last 3 days</option>
        <option value="within_week">4–7 days ago (within a week)</option>
        <option value="weeks_1_2">1–2 weeks ago</option>
        <option value="weeks_2_4">2–4 weeks ago</option>
        <option value="months_1_2">1–2 months ago</option>
        <option value="months_2_3">2–3 months ago</option>
        <option value="months_3_6">3–6 months ago</option>
        <option value="months_6_12">6–12 months ago</option>
        <option value="over_1_year">Over 1 year ago</option>
      </select>

      <div className="postingdate-inline-hint">
        If the listing shows a date (Posted / Opening / Closing), pick the closest range. If not, leave blank.
      </div>


      <div className="deep-block" style={{ marginTop: 14 }}>
        <div className="deep-label-row">
          <div className="deep-label">Add Job Description for Better Accuracy</div>
          
        </div>

        <textarea
          className="job-desc"
          placeholder="Copy and paste job description here"
          value={jobDescription}
          onChange={(e) => {
            const next = e.target.value;
            setJobDescription(next);
            if (formError) setFormError(null);
          }}
        />
      </div>
    </div>
  </div>
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
  {score === null ? (
    <>
      — <span className="muted" style={{ marginLeft: 8 }}>{rollingLine}</span>
    </>
  ) : (
    <strong>{score}%</strong>
  )}
</p>



                <p>
                  Checking posting freshness, content patterns, and activity
                  signals:{' '}
                  <strong>
                    {status === 'running' ? 'In Progress' : 'Complete'}
                  </strong>
                </p>

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
              <div className="analysis-results-summary">

  <div className="analysis-results-box">
    <div className="analysis-results-title">
      <span className="analysis-results-label">Results:</span>

      <span
        className={`analysis-results-status ${
          status === 'complete' && score !== null ? getResultBucket(score).className : ''
        }`}
      >
        {status === 'running'
          ? 'In Progress'
          : score === null
          ? '—'
          : getResultBucket(score).label}
      </span>
    </div>

    <div className="analysis-results-meta">
      <span>
        Probability Score:{' '}
        {score === null ? '—' : <strong>{score}%</strong>}
      </span>

      
    </div>
  </div>
</div>

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
                      <div className="analysis-tag" data-tip="Posting age used for scoring (from your selection when required).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Posting Age</div>
                          <div className="analysis-tag-value">
  {detectedPostingAgeValue ?? postingAgeLabel(postingDateOverride)}

</div>
                          {/* (removed) posting age source — unused */}



                        </div>
                      </div>
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
                          <div className="analysis-tag-value">{lastUpdatedAt ?? '—'}</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.detectedApplyLinkBehavior === 'complete' && (
  (lastAnalyzedUrl || url).trim() ? (
    <a
      className="analysis-tag analysis-tag-link"
      href={(lastAnalyzedUrl || url).trim()}

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
                          <div className="analysis-tag-value">
    {scoreBreakdown?.postingAge ?? 0}

</div>

                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreFreshness1 === 'complete' && (
                      <div className="analysis-tag" data-tip="Freshness-related cues (timestamps / updates).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Freshness Indicators</div>
                          <div className="analysis-tag-value">
    {scoreBreakdown?.freshness1 ?? 0}

</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreContentUniqueness === 'complete' && (
                      <div className="analysis-tag" data-tip="Content uniqueness (non-recycled language cues).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Content Uniqueness</div>
                          <div className="analysis-tag-value">
  {scoreBreakdown?.contentUniqueness ?? 0}
</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreActivityIndicators === 'complete' && (
                      <div className="analysis-tag" data-tip="Activity cues (apply / structure / signals).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Activity Indicators</div>
                          <div className="analysis-tag-value">
  {scoreBreakdown?.activityIndicators ?? 0}
</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreFreshness2 === 'complete' && (
                      <div className="analysis-tag" data-tip="Additional freshness cues (secondary pass).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Freshness Indicators</div>
                          <div className="analysis-tag-value">
  {scoreBreakdown?.freshness2 ?? 0}
</div>
                        </div>
                      </div>
                    )}

                    {analysisSteps.scoreSiteReliability === 'complete' && (
                      <div className="analysis-tag" data-tip="Site reliability cues (major platforms vs unknown).">
                        <img src={checkComplete} alt="" className="analysis-tag-icon" />
                        <div className="analysis-tag-text">
                          <div className="analysis-tag-title">Site Reliability Indicators</div>
                          <div className="analysis-tag-value">
  {scoreBreakdown?.siteReliability ?? 0}
</div>

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
      {!isPaidRoute && <Pricing />}

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


        {/* REFUND */}
        <div id="refund" className="legal-section">
          <button
            className="legal-header"
            aria-expanded={openLegal === 'refund'}
            onClick={() => toggleLegal('refund')}
          >
            <span className="legal-toggle">
              {openLegal === 'refund' ? '−' : '+'}
            </span>
            <h3>Refund Policy</h3>
          </button>

          {openLegal === 'refund' && (
            <div className="legal-content">
              <p>
                We want you to feel confident trying Ghost Job Checker.
              </p>

              <p>
                If you believe you were charged in error or experienced a technical issue that prevented normal use of the service,
                you may request a refund within 24 hours of purchase.
              </p>

              <p>
                Refund requests are reviewed on a case-by-case basis and are generally limited to accidental duplicate purchases,
                technical issues that prevented access or usage, or billing errors.
              </p>

              <p>
                Refunds are not guaranteed and are not provided for normal usage dissatisfaction, results that did not meet expectations,
                or usage after the 24-hour window.
              </p>

              <p>
  To request a refund, contact{' '}
  <a
    href="mailto:support@trusted-tools.com"
    style={{ color: '#2563eb', textDecoration: 'underline' }}
  >
    support@trusted-tools.com
  </a>{' '}
  and include the email used at checkout, the date of purchase,
  and a brief description of the issue.
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
            <a href="#refund" onClick={() => setOpenLegal('refund')}>
              Refund Policy
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
