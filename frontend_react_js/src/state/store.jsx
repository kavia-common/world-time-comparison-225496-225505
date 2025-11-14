import React, { createContext, useContext, useMemo, useReducer } from 'react';

const DEFAULT_CITIES = ['UTC', 'Europe/London', 'America/New_York'];

const initialState = {
  theme: 'light',
  cities: DEFAULT_CITIES,
  // Whether to prefer network time when available (api-auto)
  useNetworkTime: true,
  // 'local' | 'api-auto'
  clockMode: 'api-auto',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload === 'dark' ? 'dark' : 'light' };
    case 'ADD_CITY': {
      const tz = String(action.payload || '').trim();
      if (!tz) return state;
      if (state.cities.includes(tz)) return state;
      return { ...state, cities: [...state.cities, tz] };
    }
    case 'REMOVE_CITY':
      return { ...state, cities: state.cities.filter((c) => c !== action.payload) };
    case 'MOVE_UP': {
      const idx = state.cities.indexOf(action.payload);
      if (idx <= 0) return state;
      const arr = state.cities.slice();
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...state, cities: arr };
    }
    case 'MOVE_DOWN': {
      const idx = state.cities.indexOf(action.payload);
      if (idx === -1 || idx >= state.cities.length - 1) return state;
      const arr = state.cities.slice();
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      return { ...state, cities: arr };
    }
    case 'SET_USE_NETWORK_TIME':
      return { ...state, useNetworkTime: Boolean(action.payload) };
    case 'SET_CLOCK_MODE': {
      const mode = action.payload === 'local' ? 'local' : 'api-auto';
      return { ...state, clockMode: mode };
    }
    default:
      return state;
  }
}

const StoreContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * TimezoneProvider - Context provider for app state.
 */
export function TimezoneProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useMemo(() => ({
    theme: state.theme,
    setTheme: (t) => dispatch({ type: 'SET_THEME', payload: t }),

    cities: state.cities,
    addCity: (tz) => dispatch({ type: 'ADD_CITY', payload: tz }),
    removeCity: (tz) => dispatch({ type: 'REMOVE_CITY', payload: tz }),
    moveCityUp: (tz) => dispatch({ type: 'MOVE_UP', payload: tz }),
    moveCityDown: (tz) => dispatch({ type: 'MOVE_DOWN', payload: tz }),

    useNetworkTime: state.useNetworkTime,
    setUseNetworkTime: (v) => dispatch({ type: 'SET_USE_NETWORK_TIME', payload: v }),

    clockMode: state.clockMode,
    setClockMode: (m) => dispatch({ type: 'SET_CLOCK_MODE', payload: m }),
  }), [state]);

  return (
    <StoreContext.Provider value={api}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * useTimezoneStore - Hook to access global state API.
 */
export function useTimezoneStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useTimezoneStore must be used within <TimezoneProvider>');
  }
  return ctx;
}
