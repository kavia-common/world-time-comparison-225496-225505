import React from 'react';
import PropTypes from 'prop-types';
import useClock from '../hooks/useClock';
import { useTimezoneStore } from '../state/store';
import { getOffsetMinutes, getTimezoneAbbr } from '../utils/timezone';

/**
 * PUBLIC_INTERFACE
 * TimeCard - Displays a city's current local time/date and controls.
 * @param {{ timezone: string }} props
 * @returns React element
 */
function TimeCard({ timezone }) {
  const now = useClock(); // updates every second
  const { removeCity, moveCityUp, moveCityDown, cities } = useTimezoneStore();

  // Formatters per timezone
  const fmtTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false, timeZone: timezone,
  });
  const fmtDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', timeZone: timezone,
  });

  const offsetMin = getOffsetMinutes(now, timezone);
  const offsetHours = (offsetMin / 60);
  const abbr = getTimezoneAbbr(now, timezone);

  const index = cities.indexOf(timezone);

  return (
    <article className="wtc-card" aria-label={`Time card ${timezone}`}>
      <div className="wtc-card-header">
        <div>
          <div className="wtc-card-title">{timezone}</div>
          <div className="wtc-sub">{abbr} • UTC {offsetHours >= 0 ? '+' : ''}{offsetHours}</div>
        </div>
        <div className="wtc-actions" aria-label="Card actions">
          <button className="btn" onClick={() => moveCityUp(timezone)} aria-label="Move up" disabled={index <= 0}>↑</button>
          <button className="btn" onClick={() => moveCityDown(timezone)} aria-label="Move down" disabled={index >= cities.length - 1}>↓</button>
          <button className="btn" onClick={() => removeCity(timezone)} aria-label={`Remove ${timezone}`}>✕</button>
        </div>
      </div>
      <div className="wtc-time" aria-live="polite">{fmtTime.format(now)}</div>
      <div className="wtc-sub">{fmtDate.format(now)}</div>
    </article>
  );
}

TimeCard.propTypes = {
  timezone: PropTypes.string.isRequired,
};

export default TimeCard;
