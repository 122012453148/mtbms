export const BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://mtbms.onrender.com');

export const API_URL = `${BASE_URL}/api`;
