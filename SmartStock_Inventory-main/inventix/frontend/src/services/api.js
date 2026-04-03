import axios from 'axios';
import API_BASE from '../config/api';

const TOKEN_KEY = 'inventix_token';

export const getStoredToken = () => (
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
);

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(config => {
  const t = getStoredToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
