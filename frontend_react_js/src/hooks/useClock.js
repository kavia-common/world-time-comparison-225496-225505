import { useEffect, useRef, useState } from 'react';
import { useTimezoneStore } from '../state/store';
import { computeLocalTimePayload, getTimeForTimezone, hasApiBase } from '../utils/timeService';

/**
 * PUBLIC_INTERFACE
 * useClock - Ticking clock hook with optional backend time source.
 * Modes:
 *  - 'local': always use local system time
 *  - 'api-auto': use backend if REACT_APP_API_BASE is set and useNetworkTime is true; fallback to local on failures
 *
 * Handles tab visibility: slows updates when hidden to save resources.
 * Returns a Date (for formatting) and a status object indicating source.
 * @returns {{ now: Date, source: 'local'|'api'|'cache', networkEnabled: boolean }}
 */
export default function useClock(timezone = 'UTC') {
  const { clockMode, useNetworkTime } = useTimezoneStore();
  const [state, setState] = useState(() => ({ now: new Date(), source: 'local', networkEnabled: false }));
  const timerRef = useRef(null);

  useEffect(() => {
    let interval = 1000;
    const wantNetwork = clockMode !== 'local' && useNetworkTime && hasApiBase();

    const tickLocal = () => {
      setState((s) => ({ ...s, now: new Date(), source: 'local', networkEnabled: wantNetwork }));
    };

    const tickApiAuto = async () => {
      if (!wantNetwork) {
        tickLocal();
        return;
      }
      try {
        const payload = await getTimeForTimezone(timezone);
        setState({ now: new Date(payload.epochMs), source: payload.source, networkEnabled: true });
      } catch {
        // fall back to local if something unexpected occurs
        tickLocal();
      }
    };

    const tick = () => {
      if (wantNetwork) {
        // blend: get network time baseline occasionally; in-between ticks, just advance by interval.
        // For simplicity, call network each tick; service will cache/retry to smooth jitter.
        tickApiAuto();
      } else {
        tickLocal();
      }
    };

    const start = () => {
      clear();
      timerRef.current = setInterval(tick, interval);
      // immediate tick
      tick();
    };

    const clear = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const onVisibility = () => {
      interval = document.hidden ? 5000 : 1000;
      start();
    };

    document.addEventListener('visibilitychange', onVisibility);
    start();
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      clear();
    };
  }, [clockMode, useNetworkTime, timezone]);

  return state;
}
