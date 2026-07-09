// CaloriX deployment config
// After deploying the backend, replace this URL with your real Render/Koyeb API URL.
// Example: window.CALORIX_BACKEND_URL = 'https://calorix-api.onrender.com';
window.CALORIX_BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://YOUR-BACKEND-URL.onrender.com';
