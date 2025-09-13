import axios from 'axios';

// Centralized API Configuration - Change backend URL only here!
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexus-pay-fintech-application-mx5y.vercel.app/api/v1';

// Create a single axios instance that all store slices will use
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Set auth header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      // Optionally redirect to login page or dispatch logout action
    }
    return Promise.reject(error);
  }
);

// Function to display current API URL in console for debugging
export const logCurrentAPIUrl = () => {
  console.log('🌐 Current API Base URL:', API_BASE_URL);
  console.log('🔗 Full API URL will be:', `${API_BASE_URL}/[endpoint]`);
};

// Call this on app start to show which server we're connecting to
logCurrentAPIUrl();