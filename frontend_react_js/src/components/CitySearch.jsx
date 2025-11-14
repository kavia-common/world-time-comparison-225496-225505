import React, { useEffect, useMemo, useRef, useState } from 'react';
import { COMMON_TIMEZONES, filterTimezones } from '../utils/timezone';
import { useTimezoneStore } from '../state/store';

/**
 * PUBLIC_INTERFACE
 * CitySearch - Search box with suggestions to add IANA timezones to the view.
 * Works offline via static list; no external APIs required.
 */
function CitySearch() {
  const { addCity } = useTimezoneStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    return query.trim() ? filterTimezones(query, COMMON_TIMEZONES).slice(0, 12) : COMMON_TIMEZONES.slice(0, 12);
  }, [query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const onSelect = (tz) => {
    addCity(tz);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) onSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="wtc-input-wrap" role="search">
      <label htmlFor="tz-search" className="sr-only">Search city or timezone</label>
      <input
        id="tz-search"
        ref={inputRef}
        type="text"
        className="wtc-input"
        placeholder="Add a city or timezone (e.g., New York, Europe/London, Asia/Tokyo)"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
        aria-expanded={open}
        aria-controls="tz-suggestions"
        aria-autocomplete="list"
      />
      <button
        className="btn"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Hide suggestions' : 'Show suggestions'}
      >
        {open ? 'Hide' : 'Suggest'}
      </button>
      {open && suggestions.length > 0 && (
        <div className="wtc-suggestions" id="tz-suggestions" role="listbox" ref={listRef}>
          <ul>
            {suggestions.map((tz, idx) => (
              <li
                key={tz}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(tz)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                {tz}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CitySearch;
