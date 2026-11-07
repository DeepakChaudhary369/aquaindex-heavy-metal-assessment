import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration and standardize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // If token expired, clear localStorage and redirect to login
      if (error.response.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=1';
      }
      return Promise.reject(error.response.data || { message: error.message });
    }
    return Promise.reject({ message: 'Network error or backend server unreachable.' });
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUsers: () => api.get('/auth/users'),
  updateUserRole: (id, role) => api.patch(`/auth/users/${id}/role`, { role }),
};


export const samplesAPI = {
  getSamples: (params) => api.get('/samples', { params }),
  getSampleById: (id) => api.get(`/samples/${id}`),
  createSample: (data) => api.post('/samples', data),
  updateSample: (id, data) => api.put(`/samples/${id}`, data),
  deleteSample: (id) => api.delete(`/samples/${id}`),
};

export const assessmentsAPI = {
  getAssessments: (params) => api.get('/assessments', { params }),
  getAssessmentById: (id) => api.get(`/assessments/${id}`),
  calculate: (sampleId, data) => api.post(`/assessments/${sampleId}/calculate`, data),
};

export const standardsAPI = {
  getStandards: (params) => api.get('/standards', { params }),
  createStandard: (data) => api.post('/standards', data),
  updateStandard: (id, data) => api.put(`/standards/${id}`, data),
  deleteStandard: (id) => api.delete(`/standards/${id}`),
  resetDefaults: () => api.post('/standards/reset-defaults'),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getTrends: () => api.get('/dashboard/trends'),
};

export const reportsAPI = {
  getSamplesCsvUrl: () => `${API_BASE}/reports/samples.csv`,
  getAssessmentsCsvUrl: () => `${API_BASE}/reports/assessments.csv`,
};

export const auditAPI = {
  getLogs: (params) => api.get('/audit-logs', { params }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export const summaryAPI = {
  getSummary: () => api.get('/summary'),
};

export const predictionAPI = {
  predict: (data) => api.post('/predict', data),
};

export const chatAPI = {
  sendMessage: (message, history = []) => api.post('/chat', { message, history }),
};

export const datasetAPI = {
  getSamples: (params) => api.get('/dataset/samples', { params }),
  getSampleById: (id) => api.get(`/dataset/samples/${id}`),
};

export default api;
