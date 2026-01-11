// ARQUIVO: frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Mantenha a URL correta do seu deploy na Render
  baseURL: 'https://crm-seguros.onrender.com/'
});

// Leads
export const getLeads = () => api.get('/leads');
export const createLead = (data) => api.post('/leads', data);
export const updateLeadStatus = (id, status) => api.patch(`/leads/${id}`, { status });
export const updateLead = (id, data) => api.patch(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);

// Configurações
export const getConfig = () => api.get('/config');
export const saveConfig = (data) => api.post('/config', data);

// ============================================
// INBOX - Conversas e Mensagens
// ============================================
export const getConversations = () => api.get('/conversations');
export const getConversation = (id) => api.get(`/conversations/${id}`);
export const createConversation = (data) => api.post('/conversations', data);
export const markConversationAsRead = (id) => api.patch(`/conversations/${id}/read`);

export const sendMessage = (data) => api.post('/messages', data);

// ============================================
// MARKETING - Campanhas e Templates
// ============================================
export const getCampaigns = () => api.get('/campaigns');
export const createCampaign = (data) => api.post('/campaigns', data);
export const updateCampaign = (id, data) => api.patch(`/campaigns/${id}`, data);
export const deleteCampaign = (id) => api.delete(`/campaigns/${id}`);

export const getTemplates = () => api.get('/templates');
export const createTemplate = (data) => api.post('/templates', data);

// ============================================
// SERVIÇOS - Posts e Tráfego
// ============================================
export const getPosts = () => api.get('/posts');
export const createPost = (data) => api.post('/posts', data);
export const updatePost = (id, data) => api.patch(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);

export const getTrafficData = (period) => api.get('/traffic', { params: { period } });
export const saveTrafficData = (data) => api.post('/traffic', data);

// Atividades
export const getActivities = () => api.get('/activities');

export default api;