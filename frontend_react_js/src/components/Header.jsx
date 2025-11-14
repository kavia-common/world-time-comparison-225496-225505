import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * Header - Renders the app title and theme toggle button.
 * @param {Object} props
 * @param {() => void} props.onToggleTheme - Toggle callback for theme.
 * @param {"light"|"dark"} props.theme - Current theme.
 * @returns Header element
 */
function Header({ onToggleTheme, theme }) {
  return (
    <header className="wtc-header" role="banner">
      <div className="wtc-header-inner">
        <div className="wtc-brand" aria-label="Application brand">
          <div className="wtc-logo" aria-hidden="true" />
          <h1 className="wtc-title">World Time Comparison</h1>
        </div>
        <div className="wtc-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onToggleTheme: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default Header;
