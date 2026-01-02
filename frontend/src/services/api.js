import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Ajuste se seu backend estiver na nuvem
});

export const getLeads = () => api.get('/leads');
export const createLead = (data) => api.post('/leads', data);
export const updateLeadStatus = (id, status) => api.patch(`/leads/${id}`, { status });
export const deleteLead = (id) => api.delete(`/leads/${id}`);

export default api;