import axios from 'axios';

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Unauthorized - clearing auth and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
