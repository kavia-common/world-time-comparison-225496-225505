const COMMON = [
  // Popular cities/timezones
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
];

/**
 * PUBLIC_INTERFACE
 * COMMON_TIMEZONES - default list used for suggestions and initial view prep.
 */
export const COMMON_TIMEZONES = COMMON;

/**
 * PUBLIC_INTERFACE
 * filterTimezones - fuzzy filter by substring on lowercase names.
 * @param {string} q
 * @param {string[]} list
 * @returns {string[]}
 */
export function filterTimezones(q, list = COMMON) {
  const s = q.trim().toLowerCase();
  if (!s) return list;
  return list.filter((t) => t.toLowerCase().includes(s));
}

/**
 * PUBLIC_INTERFACE
 * getOffsetMinutes - Returns the UTC offset in minutes for a timezone at a Date.
 * @param {Date} date
 * @param {string} timeZone
 * @returns {number}
 */
export function getOffsetMinutes(date, timeZone) {
  // Use formatToParts to derive the offset via formatting to ISO and parsing.
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const parts = dtf.formatToParts(date);
  const map = {};
  for (const p of parts) map[p.type] = p.value;

  // Construct a date string (YYYY-MM-DDTHH:mm:ss) in the target tz.
  const y = map.year, m = map.month, d = map.day;
  const hh = map.hour, mm = map.minute, ss = map.second;
  const asUTC = Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));

  // Local timestamp in ms of the original date
  const utcMs = date.getTime();

  // Difference in minutes between "tz time" and UTC time
  return Math.round((asUTC - utcMs) / 60000);
}

/**
 * PUBLIC_INTERFACE
 * getTimezoneAbbr - Best effort to derive an abbreviation by formatting with timeZoneName
 * and extracting first token of the "longGeneric" or "short" representation.
 * @param {Date} date
 * @param {string} timeZone
 * @returns {string}
 */
export function getTimezoneAbbr(date, timeZone) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' });
    const parts = fmt.formatToParts(date);
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    // Common output like "GMT+1", "UTC", "EST", "PDT"
    return tzName;
  } catch {
    return 'UTC';
  }
}
