# World Time Comparison - React Frontend

A lightweight, offline-first React UI to view and compare world times across cities/timezones using native Intl/Date. No external API keys required.

## Features

- Classic layout (Ocean Professional theme)
- Header with app title and theme toggle
- City search with suggestions (IANA timezone names)
- Live-updating time cards (every second) with timezone abbreviation and UTC offset
- Comparison view highlighting ahead/behind vs the first city
- Add, remove, reorder cities
- Responsive design (stacked on mobile, columns on desktop)
- Accessibility and Error Boundary ready structure
- Optional network time fetch if `REACT_APP_API_BASE` is provided (not required)

## Getting Started

Install and run:

```
npm install
npm start
```

Open http://localhost:3000 to view in the browser.

## Environment Variables

The app works without any variables. The following are recognized if present:

- `REACT_APP_API_BASE`: If set (e.g., a simple endpoint exposing `/time` returning `{ epochMs }` or `{ iso }`), `utils/timezone.fetchNetworkTime()` can be used to source time from server. The UI currently uses local time by default.

Other variables present in the container:
- `REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED`
These are not required for core functionality.

Tip: Create a `.env` (or `.env.local`) with only the variables you need. Do not commit secrets.

## Usage

1. Use the search bar to type a city or timezone (e.g., "New York" or "Europe/London").
2. Select a suggestion to add it as a time card.
3. Use the up/down arrows to reorder; the first city acts as the comparison reference.
4. Remove a city using the ✕ button.
5. Toggle light/dark theme in the header.

## Preview System Notes

- If the preview session pauses or the tab becomes hidden, the clock slows to update every 5 seconds to conserve resources and resumes 1-second ticks when visible.
- The app renders offline using the local system time via `Intl.DateTimeFormat`.

## Tech Notes

- Minimal dependencies (React, react-scripts)
- CSS variables for theming under `src/styles/theme.css`
- Main layout and components styles in `src/styles/global.css`
- State management via React Context + Reducer in `src/state/store.jsx`
- Live time updates via `src/hooks/useClock.js`

## Testing

A basic smoke test verifies the app title renders:

```
npm test
```

## Accessibility

- Keyboard navigation supported in the search suggestions
- aria-* attributes provided for live regions, roles, and labels
- Screen-reader only class in `src/styles/.sr-only.css`

## License

MIT
