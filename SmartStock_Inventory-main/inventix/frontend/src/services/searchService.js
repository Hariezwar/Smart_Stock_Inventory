import api from './api';

export const globalSearch = (q) => api.get(`/search/?q=${encodeURIComponent(q)}`);
