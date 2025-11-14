//
// Time Service: optional backend-powered time with graceful fallback.
//
// PUBLIC_INTERFACE
// getTimeForTimezone - Fetch current time for a given IANA timezone using an optional backend.
// If REACT_APP_API_BASE is not set or fetch fails, falls back to local clock.
// Includes small retry/backoff and caches last good value per tz to smooth UI.
//
// Usage:
//   const { epochMs, iso, tz, offsetMinutes, source } = await getTimeForTimezone('Europe/London');
//

const API_BASE = process.env.REACT_APP_API_BASE ? String(process.env.REACT_APP_API_BASE).replace(/\/$/, '') : '';

/**
 * Cache of last good time per timezone to reduce flicker when network fails.
 * @type {Record<string, { epochMs: number, iso: string, tz: string, offsetMinutes: number, ts: number }>}
 */
const lastGoodCache = {};

/**
 * PUBLIC_INTERFACE
 * computeLocalTimePayload - Build standardized payload for a Date in a timezone using Intl.
 * @param {string} tz IANA timezone
 * @param {Date} [baseDate] optional base date (defaults to new Date())
 * @returns {{ epochMs:number, iso:string, tz:string, offsetMinutes:number, source:'local' }}
 */
export function computeLocalTimePayload(tz, baseDate = new Date()) {
  const epochMs = baseDate.getTime();
  // Offset via formatToParts similar to getOffsetMinutes implementation
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const parts = dtf.formatToParts(baseDate);
    const m = {};
    for (const p of parts) m[p.type] = p.value;
    const asUTC = Date.UTC(Number(m.year), Number(m.month) - 1, Number(m.day), Number(m.hour), Number(m.minute), Number(m.second));
    const offsetMinutes = Math.round((asUTC - epochMs) / 60000);
    const payload = { epochMs, iso: new Date(epochMs).toISOString(), tz, offsetMinutes, source: 'local' };
    return payload;
  } catch {
    // If Intl fails (invalid tz), return UTC baseline
    const payload = { epochMs, iso: new Date(epochMs).toISOString(), tz, offsetMinutes: 0, source: 'local' };
    return payload;
  }
}

/**
 * Perform a single network fetch for time.
 * Accepts either /time?tz=<iana> returning {epochMs, iso, tz, offsetMinutes}
 * or generic /time returning {epochMs} or {iso}
 * @param {string} tz
 * @returns {Promise<{ epochMs:number, iso:string, tz:string, offsetMinutes:number, source:'api' }>}
 */
async function fetchNetworkTimeOnce(tz) {
  if (!API_BASE) {
    throw new Error('API base not configured');
  }
  // try tz-aware endpoint first
  const url = `${API_BASE}/time?tz=${encodeURIComponent(tz)}`;
  let res;
  try {
    res = await fetch(url, { cache: 'no-store' });
  } catch (e) {
    // Try fallback /time without tz
    const url2 = `${API_BASE}/time`;
    res = await fetch(url2, { cache: 'no-store' });
  }
  if (!res.ok) throw new Error(`bad status ${res.status}`);
  const data = await res.json();

  let epochMs;
  if (typeof data.epochMs === 'number') {
    epochMs = data.epochMs;
  } else if (typeof data.iso === 'string') {
    epochMs = Date.parse(data.iso);
  } else {
    throw new Error('invalid payload');
  }

  // If backend provided offsetMinutes/tz use them; otherwise compute locally with provided tz
  const tzName = typeof data.tz === 'string' ? data.tz : tz;
  let offsetMinutes = typeof data.offsetMinutes === 'number' ? data.offsetMinutes : 0;
  if (typeof data.offsetMinutes !== 'number') {
    // compute offset for the same moment in the requested tz
    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: tzName,
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      const parts = dtf.formatToParts(new Date(epochMs));
      const m = {};
      for (const p of parts) m[p.type] = p.value;
      const asUTC = Date.UTC(Number(m.year), Number(m.month) - 1, Number(m.day), Number(m.hour), Number(m.minute), Number(m.second));
      offsetMinutes = Math.round((asUTC - epochMs) / 60000);
    } catch {
      offsetMinutes = 0;
    }
  }
  return {
    epochMs,
    iso: new Date(epochMs).toISOString(),
    tz: tzName,
    offsetMinutes,
    source: 'api',
  };
}

/**
 * PUBLIC_INTERFACE
 * getTimeForTimezone - Attempts to fetch time from API with retries; falls back to local.
 * Caches last good API value per tz and returns that in case of transient failures.
 * @param {string} tz
 * @param {{ retries?: number, baseDelayMs?: number }} [opts]
 * @returns {Promise<{ epochMs:number, iso:string, tz:string, offsetMinutes:number, source:'api'|'local'|'cache' }>}
 */
export async function getTimeForTimezone(tz, opts = {}) {
  const retries = Number.isFinite(opts.retries) ? opts.retries : 2;
  const baseDelayMs = Number.isFinite(opts.baseDelayMs) ? opts.baseDelayMs : 150;

  if (!API_BASE) {
    return computeLocalTimePayload(tz);
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const payload = await fetchNetworkTimeOnce(tz);
      // update cache
      lastGoodCache[tz] = { ...payload, ts: Date.now() };
      return payload;
    } catch (e) {
      lastError = e;
      if (attempt < retries) {
        const backoff = baseDelayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  // Use cache if not too old (10s) to smooth UI ticks
  const cached = lastGoodCache[tz];
  if (cached && Date.now() - cached.ts <= 10000) {
    return { ...cached, source: 'cache' };
  }

  // Fallback to local
  return computeLocalTimePayload(tz);
}

/**
 * PUBLIC_INTERFACE
 * hasApiBase - indicates if API base is configured.
 * @returns {boolean}
 */
export function hasApiBase() {
  return Boolean(API_BASE);
}

/**
 * PUBLIC_INTERFACE
 * getLastNetworkStatus - Returns last cached status per tz if available.
 * @param {string} tz
 * @returns {{ ok:boolean, lastSource?:string } }
 */
export function getLastNetworkStatus(tz) {
  const cached = lastGoodCache[tz];
  if (cached) return { ok: true, lastSource: 'api' };
  return { ok: false, lastSource: 'local' };
}
