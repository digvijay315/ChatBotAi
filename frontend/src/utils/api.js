import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  baseURL:'https://chatbotai-gtpm.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token automatically from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
