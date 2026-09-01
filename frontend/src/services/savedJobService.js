import api from './api';

export const savedJobService = {
  toggleSave: (jobId) => api.post(`/saved-jobs/${jobId}`),
  getSavedJobs: (params) => api.get('/saved-jobs', { params }),
  checkSaved: (jobId) => api.get(`/saved-jobs/check/${jobId}`),
};
