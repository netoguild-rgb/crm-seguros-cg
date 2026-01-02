import axios from 'axios';

const api = axios.create({
  // Mantenha a URL do seu backend na Render
  baseURL: 'https://crm-seguros.onrender.com/' 
});

export const getLeads = () => api.get('/leads');
export const createLead = (data) => api.post('/leads', data);

// Mantida para compatibilidade
export const updateLeadStatus = (id, status) => api.patch(`/leads/${id}`, { status });

// --- AQUI ESTÁ A CORREÇÃO ---
// Adicionamos a função 'updateLead' que estava faltando e causava o erro
export const updateLead = (id, data) => api.patch(`/leads/${id}`, data);
// ----------------------------

export const deleteLead = (id) => api.delete(`/leads/${id}`);

export default api;