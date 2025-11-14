import { useEffect, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * useClock - A lightweight ticking clock that updates once per second.
 * Handles tab visibility: slows updates when hidden to save resources.
 * @returns {Date} current timestamp Date object
 */
export default function useClock() {
  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef(null);

  useEffect(() => {
    let interval = 1000;

    const tick = () => setNow(new Date());

    const start = () => {
      clear();
      timerRef.current = setInterval(tick, interval);
    };

    const clear = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const onVisibility = () => {
      // When hidden, slow to 5s to conserve; restore to 1s when visible
      interval = document.hidden ? 5000 : 1000;
      start();
    };

    document.addEventListener('visibilitychange', onVisibility);
    start();
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      clear();
    };
  }, []);

  return now;
}
