import api from './api';

export const alertService = {
  createAlert: (data) => api.post('/alerts', data),
  getAlerts: () => api.get('/alerts'),
  updateAlert: (id, data) => api.put(`/alerts/${id}`, data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
};
