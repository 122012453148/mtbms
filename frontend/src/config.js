const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const BASE_URL = isLocal 
    ? 'http://localhost:5000' 
    : 'https://mtbms.onrender.com';

export const API_URL = `${BASE_URL}/api`;
