// ARQUIVO: frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  // MUDE DISTO:
  // baseURL: 'http://localhost:3000'
  
  // PARA ISTO (use o link do SEU render):
  baseURL: 'https://seu-backend-crm-seguros.onrender.com' 
});

export const getLeads = () => api.get('/leads');
export const createLead = (data) => api.post('/leads', data);
export const updateLeadStatus = (id, status) => api.patch(`/leads/${id}`, { status });
export const deleteLead = (id) => api.delete(`/leads/${id}`);

export default api;