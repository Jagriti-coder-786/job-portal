import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getRecruiters: (params) => api.get('/admin/recruiters', { params }),
  getCompanies: (params) => api.get('/admin/companies', { params }),
  updateCompanyStatus: (id, status) => api.put(`/admin/companies/${id}/status`, { status }),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  updateJobStatus: (id, status) => api.put(`/admin/jobs/${id}/status`, { status }),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  toggleSuspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
  getRecentActivity: () => api.get('/admin/activity'),
};
