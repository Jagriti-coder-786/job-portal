import api from './api';

export const aiService = {
  getMatch: (jobId) => api.post('/ai/match', { jobId }),
  getStatus: () => api.get('/ai/status'),
};
