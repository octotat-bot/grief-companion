// config.js
// In development: empty string → Vite proxy handles /api/* → localhost:3001
// In production: full Render backend URL
const API = import.meta.env.VITE_API_URL || '';
export default API;
