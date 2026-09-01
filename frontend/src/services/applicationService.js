import api from './api';

export const applicationService = {
  apply: (formData) => api.post('/applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyApplications: (params) => api.get('/applications/my', { params }),
  getJobApplicants: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.put(`/applications/${id}/interview`, data),
  withdraw: (id) => api.put(`/applications/${id}/withdraw`),
  downloadResume: (id) => api.get(`/applications/${id}/resume`),
};
