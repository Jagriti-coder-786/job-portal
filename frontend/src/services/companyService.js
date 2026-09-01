import api from './api';

export const companyService = {
  getCompanies: (params) => api.get('/companies', { params }),
  getCompany: (id) => api.get(`/companies/${id}`),
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  uploadLogo: (id, formData) => api.put(`/companies/${id}/logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyCompany: () => api.get('/companies/my/company'),
  addReview: (companyId, data) => api.post(`/companies/${companyId}/reviews`, data),
  getReviews: (companyId) => api.get(`/companies/${companyId}/reviews`),
};
