// Set VITE_API_BASE in Vercel to the public PHP API URL before production deploy.
// The fallback keeps the existing XAMPP development path working locally.
export const API_BASE = import.meta.env.VITE_API_BASE || `${window.location.protocol}//${window.location.hostname}/SANOBAZAR/backend`;
