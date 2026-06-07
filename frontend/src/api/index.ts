/**
 * Axios API service layer
 * All HTTP requests go through this module — centralizes auth headers and error handling.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`,
  headers: { 'Content-Type': 'application/json' },
});
// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Resumes ──────────────────────────────────────────────────────────────────
export const resumesApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/resumes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  myResumes: () => api.get('/resumes/my'),
  allResumes: () => api.get('/resumes/all'),
};

// ─── Jobs ──────────────────────────────────────────────────────────────────────
export const jobsApi = {
  create: (data: { title: string; description: string; required_skills: string[] }) =>
    api.post('/jobs', data),
  list: () => api.get('/jobs'),
  get: (id: number) => api.get(`/jobs/${id}`),
  update: (id: number, data: Partial<{ title: string; description: string; required_skills: string[] }>) =>
    api.put(`/jobs/${id}`, data),
  delete: (id: number) => api.delete(`/jobs/${id}`),
};

// ─── Analysis ─────────────────────────────────────────────────────────────────
export const analysisApi = {
  rankCandidates: (jobId: number) =>
    api.post('/analysis/rank', { job_id: jobId }),
  getDetail: (resumeId: number, jobId: number) =>
    api.get(`/analysis/detail/${resumeId}/${jobId}`),
  getCandidateAnalysis: (resumeId: number) =>
    api.get(`/analysis/candidate/${resumeId}`),
};

export default api;
