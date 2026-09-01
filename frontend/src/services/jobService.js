import api from './api';

export const jobService = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  updateJobStatus: (id, status) => api.put(`/jobs/${id}/status`, { status }),
  getRecommendedJobs: (limit = 10) => api.get('/jobs/recommended', { params: { limit } }),
  getMyJobs: (params) => api.get('/jobs/recruiter/my-jobs', { params }),
  reportJob: (id, data) => api.post(`/reports/jobs/${id}`, data),
};
