/**
 * API Client with Axios and Retry Logic
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry logic for failed requests
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  },
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear localStorage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }

    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// API Methods
export const API = {
  // Auth
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),

  // Questions
  getQuestions: (params) => apiClient.get('/questions', { params }),
  getQuestion: (id) => apiClient.get(`/questions/${id}`),
  searchQuestions: (query) => apiClient.get('/questions/search', { params: { search: query } }),

  // Code Execution
  executeCode: (data) => apiClient.post('/code/execute', data),

  // User
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  getLeaderboard: (params) => apiClient.get('/users/leaderboard', { params }),

  // AI
  getHint: (questionId) => apiClient.get(`/ai/hint/${questionId}`),
  getInterviewPlan: (data) => apiClient.post('/ai/interview-plan', data),

  // Discussion
  getThreads: (params) => apiClient.get('/discuss/threads', { params }),
  createThread: (data) => apiClient.post('/discuss/threads', data),
  replyToThread: (threadId, data) => apiClient.post(`/discuss/threads/${threadId}/replies`, data),

  // Tracker
  submitSolution: (data) => apiClient.post('/tracker/submit', data),
  getUserStats: () => apiClient.get('/tracker/stats'),
};

export default apiClient;
