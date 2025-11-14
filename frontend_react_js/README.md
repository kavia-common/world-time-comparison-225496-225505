# World Time Comparison - React Frontend

This project implements the initial UI for comparing world times using native Intl/Date (no external keys required).

- Classic layout (Ocean Professional theme)
- Header with theme toggle
- City search with suggestions
- Live-updating time cards
- Comparison view with ahead/behind indicators
- Add/remove/reorder cities
- Responsive and accessible

See `README_WORLD_TIME.md` for detailed usage, environment variables, and preview notes.

## Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Production build

## Environment

The app runs offline. For optional network time source, set `REACT_APP_API_BASE` to a server exposing `/time` returning `{ epochMs }` or `{ iso }`.
