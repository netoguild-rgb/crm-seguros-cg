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

// Configurações (Novo)
export const getConfig = () => api.get('/config');
export const saveConfig = (data) => api.post('/config', data);

export default api;