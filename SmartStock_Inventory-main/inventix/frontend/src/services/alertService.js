import api from './api';

export const getAlerts = () => api.get('/alerts/');
export const emailAlert = (id) => api.post(`/alerts/${id}/email`);
export const orderAlert = (id) => api.post(`/alerts/${id}/create-order`);
export const dismissAlert = (id) => api.delete(`/alerts/${id}`);
