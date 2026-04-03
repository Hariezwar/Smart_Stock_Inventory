import os

services_dir = r"C:\Users\User\Downloads\inventix (1)\inventix\frontend\src\services"
os.makedirs(services_dir, exist_ok=True)

# api.js
with open(os.path.join(services_dir, 'api.js'), 'w', encoding='utf-8') as f:
    f.write('''import axios from 'axios';
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
  if (t) config.headers['Authorization'] = Bearer ;
  return config;
});

export default api;
''')

# alertService.js
with open(os.path.join(services_dir, 'alertService.js'), 'w', encoding='utf-8') as f:
    f.write('''import api from './api';

export const getAlerts = () => api.get('/alerts/');
export const emailAlert = (id) => api.post(/alerts//email);
export const orderAlert = (id) => api.post(/alerts//create-order);
export const dismissAlert = (id) => api.delete(/alerts/);
''')

# dashboardService.js
with open(os.path.join(services_dir, 'dashboardService.js'), 'w', encoding='utf-8') as f:
    f.write('''import api from './api';

export const getStats = () => api.get('/dashboard/stats');
''')

# productService.js
with open(os.path.join(services_dir, 'productService.js'), 'w', encoding='utf-8') as f:
    f.write('''import api from './api';

export const getProducts = () => api.get('/products/');
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(/products/, data);
export const deleteProduct = (id) => api.delete(/products/);
''')

# supplierService.js
with open(os.path.join(services_dir, 'supplierService.js'), 'w', encoding='utf-8') as f:
    f.write('''import api from './api';

export const getSuppliers = () => api.get('/suppliers/');
export const createSupplier = (data) => api.post('/suppliers/', data);
export const updateSupplier = (id, data) => api.put(/suppliers/, data);
export const deleteSupplier = (id) => api.delete(/suppliers/);
''')

# purchaseHistoryService.js
with open(os.path.join(services_dir, 'purchaseHistoryService.js'), 'w', encoding='utf-8') as f:
    f.write('''import api from './api';

export const getPurchaseHistory = () => api.get('/purchase-history/');
export const createPurchaseHistory = (data) => api.post('/purchase-history/', data);
''')

# searchService.js
with open(os.path.join(services_dir, 'searchService.js'), 'w', encoding='utf-8') as f:
    f.write('''import api from './api';

export const globalSearch = (q) => api.get(/search/?q=);
''')

# chatbotService.js
with open(os.path.join(services_dir, 'chatbotService.js'), 'w', encoding='utf-8') as f:
    f.write('''import api from './api';

export const askChatbot = (message) => api.post('/chatbot/ask', { message });
''')

# authService.js
with open(os.path.join(services_dir, 'authService.js'), 'w', encoding='utf-8') as f:
    f.write('''import api from './api';

export const getMe = () => api.get('/auth/me');
export const login = (data, headers) => api.post('/auth/login', data, { headers });
export const register = (data) => api.post('/auth/register', data);
export const updateProfile = (updates) => api.patch('/auth/me', updates);
export const uploadAvatar = (formData, headers) => api.post('/auth/me/avatar', formData, { headers });
export const setupSecurityQuestion = (data) => api.post('/auth/security-question/setup', data);
export const disableSecurityQuestion = (data) => api.post('/auth/security-question/disable', data);
export const resetPasswordConfirm = (data) => api.post('/auth/reset-password/confirm', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
''')

