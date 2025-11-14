import React, { useMemo } from 'react';
import useClock from '../hooks/useClock';
import { useTimezoneStore } from '../state/store';
import { getOffsetMinutes } from '../utils/timezone';

/**
 * PUBLIC_INTERFACE
 * ComparisonBar - Shows relative time differences between selected cities.
 * Uses the first city as the baseline reference.
 */
function ComparisonBar() {
  const { cities } = useTimezoneStore();
  // Use reference timezone for the clock baseline to compute offsets consistently
  const refTz = cities[0] || 'UTC';
  const { now, source, networkEnabled } = useClock(refTz);

  const diffs = useMemo(() => {
    if (cities.length === 0) return [];
    const baseOffset = getOffsetMinutes(now, refTz);
    return cities.map((tz) => {
      const off = getOffsetMinutes(now, tz);
      const deltaMin = off - baseOffset;
      const deltaHours = Math.round((deltaMin / 60) * 10) / 10;
      return { tz, deltaHours };
    });
  }, [cities, now, refTz]);

  if (cities.length <= 1) {
    return (
      <div className="wtc-card" role="note">
        <div className="wtc-card-header">
          <div className="wtc-card-title">Comparison</div>
          <span className="wtc-badge">Add more cities to compare</span>
        </div>
        <div className="wtc-sub">The first selected city acts as the reference.</div>
      </div>
    );
  }

  const ref = refTz;

  const statusText = networkEnabled
    ? (source === 'api' ? 'Network time' : source === 'cache' ? 'Network (cached)' : 'Local time')
    : 'Local time';
  const statusClass =
    source === 'api' ? 'wtc-badge'
      : source === 'cache' ? 'wtc-badge'
      : 'wtc-badge';

  return (
    <div className="wtc-card" aria-label="Comparison summary">
      <div className="wtc-card-header">
        <div className="wtc-card-title">Comparison</div>
        <div className="wtc-actions" aria-label="status">
          <span className={statusClass} title={`Source: ${statusText}`}>{statusText}</span>
        </div>
      </div>
      <div className="wtc-sub">Reference: {ref}</div>
      <div className="wtc-diff">
        {diffs.map(({ tz, deltaHours }) => {
          if (tz === ref) {
            return (
              <span key={tz} className="wtc-diff-item" aria-label={`${tz} is reference`}>
                {tz}: ±0h
              </span>
            );
          }
          const cls = deltaHours > 0 ? 'wtc-diff-item positive' : deltaHours < 0 ? 'wtc-diff-item negative' : 'wtc-diff-item';
          const label = deltaHours > 0 ? 'ahead' : deltaHours < 0 ? 'behind' : 'same';
          return (
            <span key={tz} className={cls} aria-label={`${tz} is ${Math.abs(deltaHours)} hours ${label}`}>
              {tz}: {Math.abs(deltaHours)}h {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default ComparisonBar;
