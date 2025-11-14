import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary - Catches render errors and shows a friendly message.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(error) {
    return { err: error };
  }
  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    const { err } = this.state;
    if (err) {
      return (
        <div className="wtc-main">
          <div className="wtc-card">
            <div className="wtc-card-header">
              <div className="wtc-card-title">Something went wrong</div>
            </div>
            <div className="wtc-sub">Please reload the page. If the issue persists, check the console.</div>
          </div>
        </div>
      );
    }
    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}
