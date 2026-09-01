import api from './api';

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadResume: (formData) => api.put('/users/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  parseResume: (formData) => api.post('/users/resume/parse', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  downloadResume: () => api.get('/users/resume/download'),
  getUserById: (id) => api.get(`/users/${id}`),
};
