import express from 'express';
import fetch from 'node-fetch';

import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- HEALTH ---------------- */

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

/* ---------------- ANALYZE ---------------- */

app.post('/api/analyze', async (req, res) => {
  console.log('[ANALYZE] request received:', req.body.url);

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'GhostJobChecker/1.0',
      },
    });

    const status = response.status;
    const lastModifiedHeader = response.headers.get('last-modified');
    const html = await response.text();

    /* ---------- DATE DETECTION (v1) ---------- */

    let detectedDate = null;

    if (lastModifiedHeader) {
      const parsed = new Date(lastModifiedHeader);
      if (!isNaN(parsed.getTime())) {
        detectedDate = parsed;
      }
    }

    let daysOld = null;
    if (detectedDate) {
      const now = new Date();
      daysOld = Math.floor(
        (now.getTime() - detectedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    /* ---------- CLASSIFICATION ---------- */

    let freshness = 'missing';
    if (daysOld !== null) {
      if (daysOld <= 45) freshness = 'fresh';
      else if (daysOld <= 90) freshness = 'aging';
      else freshness = 'stale';
    }

    const score = freshness === 'fresh' ? 85 : freshness === 'aging' ? 55 : 25;

    /* ---------- RESPONSE ---------- */

    res.json({
      score,
      signals: {
        stale: {
          result: freshness === 'stale',
          delay: 1000,
          info: daysOld !== null ? `${daysOld} days old` : 'No date detected',
        },
        weak: {
          result: false,
          delay: 2200,
        },
        inactivity: {
          result: status !== 200,
          delay: 3400,
        },
      },
    });
  } catch (err) {
    console.error('[ANALYZE] fetch failed:', err.message);
    res.status(500).json({
      error: 'Failed to fetch job page',
    });
  }
});

export default app;
