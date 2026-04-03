import api from './api';

export const askChatbot = (message) => api.post('/chatbot/ask', { message });
