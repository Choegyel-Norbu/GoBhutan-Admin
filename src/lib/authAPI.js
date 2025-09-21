import axios from 'axios';
import { API_CONFIG } from './api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // You might want to redirect to login page here
      console.warn('Session expired. Please log in again.');
    }
    
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  /**
   * Login user with email and password
   * @param {object} credentials - { email, password }
   * @returns {Promise} - Axios response
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Store token and user data if login successful
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      // Handle login errors with custom messages
      if (error.response?.status === 401) {
        throw new Error('The email or password you entered is incorrect. Please try again.');
      } else if (error.response?.status === 422) {
        throw new Error('Please check that your email and password are formatted correctly.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please wait a moment before trying again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Our servers are experiencing issues. Please try again in a few minutes.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('The request is taking too long. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Unable to connect to our servers. Please check your internet connection.');
      } else {
        throw new Error(error.response.data?.message || 'Something went wrong during login. Please try again.');
      }
    }
  },

  /**
   * Sign up user with username, email and password
   * @param {object} userData - { username, email, password }
   * @returns {Promise} - Axios response
   */
  signup: async (userData) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, userData);
      
      // Store token and user data if signup successful
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      // Handle signup errors with custom messages
      if (error.response?.status === 400) {
        throw new Error('Please check that all fields are filled correctly.');
      } else if (error.response?.status === 409) {
        throw new Error('An account with this email or username already exists. Please try logging in instead.');
      } else if (error.response?.status === 422) {
        throw new Error('Please check that your information is formatted correctly.');
      } else if (error.response?.status >= 500) {
        throw new Error('Our servers are experiencing issues. Please try again in a few minutes.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('The request is taking too long. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Unable to connect to our servers. Please check your internet connection.');
      } else {
        throw new Error(error.response.data?.message || 'Something went wrong during sign up. Please try again.');
      }
    }
  },

  /**
   * Logout user
   * @returns {Promise} - Axios response
   */
  logout: async () => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      
      // Clear stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      console.warn('Logout request failed, but local data cleared:', error.message);
      return { data: { success: true } };
    }
  },

  /**
   * Get user profile
   * @returns {Promise} - Axios response
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again to view your profile.');
      }
      throw error;
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise} - Axios response
   */
  refreshToken: async () => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response;
    } catch (error) {
      // If refresh fails, clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  /**
   * Get stored user data
   * @returns {object|null} - User data or null
   */
  getStoredUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Get stored auth token
   * @returns {string|null} - Auth token or null
   */
  getStoredToken: () => {
    return localStorage.getItem('authToken');
  }
};

export default authAPI;
