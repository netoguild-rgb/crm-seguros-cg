// ARQUIVO: frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Mantenha a URL correta do seu deploy na Render
  baseURL: 'https://crm-seguros.onrender.com/'
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      // Opcionalmente redirecionar para login
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTENTICAÇÃO
// ============================================
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password) => api.post('/auth/register', { name, email, password });
export const getMe = () => api.get('/auth/me');

// ============================================
// STRIPE - Pagamentos
// ============================================
export const getPlans = () => api.get('/stripe/plans');
export const createCheckoutSession = (plan) => api.post('/stripe/create-checkout-session', { plan });
export const getSubscription = () => api.get('/stripe/subscription');
export const cancelSubscription = () => api.post('/stripe/cancel');
export const demoUpgrade = (plan) => api.post('/stripe/demo-upgrade', { plan });

// ============================================
// LEADS
// ============================================
export const getLeads = () => api.get('/leads');
export const createLead = (data) => api.post('/leads', data);
export const updateLeadStatus = (id, status) => api.patch(`/leads/${id}`, { status });
export const updateLead = (id, data) => api.patch(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);

// ============================================
// CONFIGURAÇÕES
// ============================================
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

// ============================================
// ATIVIDADES
// ============================================
export const getActivities = () => api.get('/activities');

// ============================================
// APÓLICES (Enterprise)
// ============================================
export const getPolicies = (params) => api.get('/policies', { params });
export const getPolicyById = (id) => api.get(`/policies/${id}`);
export const getPoliciesStats = () => api.get('/policies/stats');
export const createPolicy = (data) => api.post('/policies', data);
export const updatePolicy = (id, data) => api.put(`/policies/${id}`, data);
export const deletePolicy = (id) => api.delete(`/policies/${id}`);

export default api;