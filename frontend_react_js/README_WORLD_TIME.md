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

- `REACT_APP_API_BASE`: If set to a server URL, the app can use a network-backed time endpoint to source current time. The UI includes a "Network Time" toggle in the header. When enabled, the app will call:
  - `GET ${REACT_APP_API_BASE}/time?tz=<IANA>` for timezone-aware current time, or fall back to `GET ${REACT_APP_API_BASE}/time` if the tz query is not supported.

### Endpoint Contract

Request:
- Method: GET
- Path: `/time`
- Optional Query: `tz` (IANA timezone string), e.g., `tz=Europe/London`

Response (preferred):
```json
{
  "epochMs": 1731609600000,
  "iso": "2024-11-14T00:00:00.000Z",
  "tz": "Europe/London",
  "offsetMinutes": 0
}
```

Response (minimal accepted):
```json
{ "epochMs": 1731609600000 }
```
or
```json
{ "iso": "2024-11-14T00:00:00.000Z" }
```

Notes:
- If `offsetMinutes` is omitted, the client computes it for the requested `tz`.
- If `tz` is omitted, the client assumes the requested tz and computes offset with Intl.

### Client Behavior

- When `REACT_APP_API_BASE` is provided and "Network Time" is ON, the app prefers network time (`api-auto` mode).
- The client implements small retry/backoff and caches the last good value per timezone for ~10s to smooth the UI.
- If the request fails or the API is unreachable, the app gracefully falls back to local time.
- A status badge is displayed in the Comparison bar: "Network time", "Network (cached)", or "Local time".

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
6. Optional: Toggle "Network Time" in the header to use server-provided time (when `REACT_APP_API_BASE` is set).

## Preview System Notes

- If the preview session pauses or the tab becomes hidden, the clock slows to update every 5 seconds to conserve resources and resumes 1-second ticks when visible.
- The app renders offline using the local system time via `Intl.DateTimeFormat`.

## Tech Notes

- Minimal dependencies (React, react-scripts)
- CSS variables for theming under `src/styles/theme.css`
- Main layout and components styles in `src/styles/global.css`
- State management via React Context + Reducer in `src/state/store.jsx`
- Live time updates via `src/hooks/useClock.js`
- Network time utility in `src/utils/timeService.js`

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
