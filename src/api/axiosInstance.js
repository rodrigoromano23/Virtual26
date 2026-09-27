import axios from 'axios';

const api = axios.create({
  baseURL: 'https://virtual2026.onrender.com/api',
});

export default api;