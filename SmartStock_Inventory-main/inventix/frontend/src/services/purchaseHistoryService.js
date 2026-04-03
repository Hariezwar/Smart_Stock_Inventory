import api from './api';

export const getPurchaseHistory = () => api.get('/purchase-history/');
export const createPurchaseHistory = (data) => api.post('/purchase-history/', data);
