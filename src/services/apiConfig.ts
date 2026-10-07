// One API origin for every feature. Production defaults to the same origin.
export const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/api\/?$/, '').replace(/\/$/, '');
export const DEMO_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO === 'true';
