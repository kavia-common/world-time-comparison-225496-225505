import React, { useEffect } from 'react';
import './styles/global.css';
import './styles/theme.css';
import Header from './components/Header';
import CitySearch from './components/CitySearch';
import TimeCard from './components/TimeCard';
import ComparisonBar from './components/ComparisonBar';
import { TimezoneProvider, useTimezoneStore } from './state/store';

/**
 * The main content of the World Time Comparison app rendering the header,
 * search, time cards, and comparison view.
 */
function AppContent() {
  const { cities, theme, setTheme } = useTimezoneStore();

  // Apply theme to document root for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const onToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="wtc-app">
      <Header onToggleTheme={onToggleTheme} theme={theme} />
      <main className="wtc-main" role="main">
        <section className="wtc-toolbar" aria-label="City search and actions">
          <CitySearch />
        </section>
        <section className="wtc-comparison" aria-label="Time difference comparison">
          <ComparisonBar />
        </section>
        <section className="wtc-grid" aria-live="polite" aria-busy="false">
          {cities.map((tz) => (
            <TimeCard key={tz} timezone={tz} />
          ))}
          {cities.length === 0 && (
            <div className="wtc-empty" role="note">
              <p>No cities selected yet. Use the search above to add cities by timezone.</p>
            </div>
          )}
        </section>
      </main>
      <footer className="wtc-footer">
        <small>
          World Time Comparison — local time computed with Intl/Date. Optional network time via REACT_APP_API_BASE.
        </small>
      </footer>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * App - Root component that wires up global state and renders the UI.
 * This is the entry point used by index.js.
 */
function App() {
  return (
    <TimezoneProvider>
      <AppContent />
    </TimezoneProvider>
  );
}

export default App;
