// components/ActivityGauge.tsx

import { useEffect, useMemo, useRef, useState } from 'react';
import './ActivityGauge.css';

type Status = 'idle' | 'running' | 'complete';

type Props = {
  status: Status;
  targetPercent: number;   // 0–100
  durationMs: number;      // how long the “ramp” should take
  runId: number;           // bump this to restart animation cleanly
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = degToRad(angleDeg);
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);

  // If sweep > 180°, large-arc-flag = 1
  const sweep = Math.abs(endAngle - startAngle);
  const largeArc = sweep > 180 ? 1 : 0;

  // Always draw in the “short” direction from start -> end by using sweep-flag = 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function ActivityGauge({
  status,
  targetPercent,
  durationMs,
  runId,
}: Props) {
  const safeTarget = clamp(targetPercent ?? 0, 0, 100);
  const safeDuration = Math.max(500, Number.isFinite(durationMs) ? durationMs : 1400);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const lastRunIdRef = useRef<number>(-1);

  const [displayPct, setDisplayPct] = useState<number>(0);

  // Gauge geometry (256x256)
  const cx = 128;
  const cy = 156; // center Y (tweak 150–170 to taste)
  const r = 92;


  // Arc sweep similar to your mock: 270° (from 225° down-left to -45° down-right)
const arcStart = 135;  // lower-left
const arcEnd = 405;    // lower-right (45 + 360) so the sweep goes over the top


  const arcPath = useMemo(
  () => describeArc(cx, cy, r, arcStart, arcEnd),
  [cx, cy, r, arcStart, arcEnd]
);


  // Convert percent -> needle angle
  const needleAngleBase = useMemo(() => {
    const pct = clamp(displayPct, 0, 100);
    return arcStart + ((arcEnd - arcStart) * pct) / 100;
  }, [displayPct]);

  // Subtle “processing shake” (angle jitter only, not the numeric)
  const jitterDeg = useMemo(() => {
    if (status !== 'running') return 0;
    // Smooth, non-sporadic vibration (no random() flicker)
    const t = performance.now();
    const wobble =
      Math.sin(t / 85) * 0.9 +
      Math.sin(t / 170) * 0.6 +
      Math.sin(t / 43) * 0.25;
    return wobble * 0.6; // keep subtle
  }, [status, displayPct]); // include displayPct so it updates naturally during run

  const needleAngle = needleAngleBase + jitterDeg;

  // Needle endpoints
  const needleInner = polarToCartesian(cx, cy, 18, needleAngle);
  const needleOuter = polarToCartesian(cx, cy, r - 18, needleAngle);

  // Tick labels
  const ticks = useMemo(() => [0, 25, 50, 75, 100], []);



  useEffect(() => {
    // Stop any prior animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // On idle, hard reset to 0
    if (status === 'idle') {
      setDisplayPct(0);
      lastRunIdRef.current = runId;
      return;
    }

    // If runId changed, restart from 0 for a clean “new test”
    if (lastRunIdRef.current !== runId) {
      setDisplayPct(0);
      lastRunIdRef.current = runId;
    }

    const from = 0;
    const to = safeTarget;

    startRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const t = clamp(elapsed / safeDuration, 0, 1);
      const eased = easeOutCubic(t);
      const next = from + (to - from) * eased;

      setDisplayPct(next);

      if (t < 1 && status === 'running') {
        rafRef.current = requestAnimationFrame(step);
      } else {
        // When complete, lock exactly on target
        setDisplayPct(to);
        rafRef.current = null;
      }
    };

    // If complete, just lock (or if duration is tiny)
    if (status === 'complete') {
      setDisplayPct(safeTarget);
      return;
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [status, safeTarget, safeDuration, runId]);

  const labelPct = Math.round(displayPct);

  return (
    <div className="activity-gauge" aria-label={`Probability score ${labelPct}%`}>
      <svg
        className="activity-gauge-svg"
        viewBox="0 0 256 256"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gArc" x1="40" y1="220" x2="216" y2="60">
            <stop offset="0%" stopColor="#1e40ff" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>

          <filter id="gShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.18" />
          </filter>
        </defs>

                     {/* Tick marks (LINES) — behind arc */}
        {ticks.map((t) => {
          const a = arcStart + ((arcEnd - arcStart) * t) / 100;
          const p = polarToCartesian(cx, cy, r - 2, a);
          const p2 = polarToCartesian(cx, cy, r - 24, a);

          return (
            <line
              key={`tick-line-${t}`}
              x1={p.x}
              y1={p.y}
              x2={p2.x}
              y2={p2.y}
              className="activity-gauge-tick"
            />
          );
        })}

        {/* Arc — on top of tick lines */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#gArc)"
          strokeWidth="18"
          strokeLinecap="round"
          filter="url(#gShadow)"
        />

        {/* Tick numbers (TEXT) — above arc */}
        {ticks.map((t) => {
          const a = arcStart + ((arcEnd - arcStart) * t) / 100;
          const lbl = polarToCartesian(cx, cy, r - 42, a);

          return (
            <text
              key={`tick-text-${t}`}
              x={lbl.x}
              y={lbl.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="activity-gauge-label"
            >
              {t}
            </text>
          );
        })}

        {/* Needle + hub — top layer */}
        <line
          x1={needleInner.x}
          y1={needleInner.y}
          x2={needleOuter.x}
          y2={needleOuter.y}
          className="activity-gauge-needle"
        />
        <circle cx={cx} cy={cy} r="12" className="activity-gauge-hub" />

    </div>
  );
}
