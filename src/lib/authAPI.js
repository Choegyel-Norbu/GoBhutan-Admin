import axios from 'axios';
import { API_CONFIG } from './api';
import { extractRolesFromToken, extractUserInfoFromToken } from './tokenUtils';

// Secure localStorage utilities for cross-browser compatibility
const AUTH_STORAGE_KEY = 'gobhutan_auth_data';
const USER_STORAGE_KEY = 'gobhutan_user_data';
const ROLES_STORAGE_KEY = 'gobhutan_user_roles';

// Helper functions for secure localStorage operations
const setSecureStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Error storing data in localStorage for key "${key}":`, error);
    return false;
  }
};

const getSecureStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving data from localStorage for key "${key}":`, error);
    return null;
  }
};

const removeSecureStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data from localStorage for key "${key}":`, error);
    return false;
  }
};

// Auth data management functions
const storeAuthData = (authData) => {
  const dataToStore = {
    accessToken: authData.accessToken,
    refreshToken: authData.refreshToken,
    keycloakId: authData.keycloakId,
    userId: authData.userId,
    username: authData.username,
    clients: authData.clients,
    timestamp: Date.now()
  };
  return setSecureStorage(AUTH_STORAGE_KEY, dataToStore);
};

const getStoredAuthData = () => {
  return getSecureStorage(AUTH_STORAGE_KEY);
};

const clearStoredAuthData = () => {
  removeSecureStorage(AUTH_STORAGE_KEY);
  removeSecureStorage(USER_STORAGE_KEY);
  removeSecureStorage(ROLES_STORAGE_KEY);
};

const storeUserData = (userData) => {
  return setSecureStorage(USER_STORAGE_KEY, userData);
};

const getStoredUserData = () => {
  return getSecureStorage(USER_STORAGE_KEY);
};

const storeUserRoles = (roles) => {
  return setSecureStorage(ROLES_STORAGE_KEY, roles);
};

const getStoredUserRoles = () => {
  return getSecureStorage(ROLES_STORAGE_KEY) || [];
};

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const authData = getStoredAuthData();
    if (authData?.accessToken) {
      config.headers.Authorization = `Bearer ${authData.accessToken}`;
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
      // Unauthorized - clear auth data and redirect to login
      clearStoredAuthData();
      console.warn('Session expired. Please log in again.');
    }
    
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  /**
   * Login user with username and password
   * @param {object} credentials - { username, password }
   * @returns {Promise} - Axios response
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Store auth data if login successful
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        
        // Store authentication data
        storeAuthData(authData);
        
        // Extract roles from the access token
        const userRoles = extractRolesFromToken(authData.accessToken);
        const tokenUserInfo = extractUserInfoFromToken(authData.accessToken);
        
        // Store user roles
        storeUserRoles(userRoles);
        
        // Store user profile data with roles
        const userProfile = {
          keycloakId: authData.keycloakId,
          userId: authData.userId,
          username: authData.username,
          clients: authData.clients,
          name: authData.name || authData.username,
          email: authData.email || '',
          roles: userRoles,
          loginTime: new Date().toISOString()
        };
        storeUserData(userProfile);
        
        console.log('Extracted roles from token:', userRoles);
        console.log('Token user info:', tokenUserInfo);
      }
      
      return response;
    } catch (error) {
      // Handle login errors with custom messages
      if (error.response?.status === 401) {
        throw new Error('The username or password you entered is incorrect. Please try again.');
      } else if (error.response?.status === 422) {
        throw new Error('Please check that your username and password are formatted correctly.');
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
      
      // Store auth data if signup successful
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        
        // Store authentication data
        storeAuthData(authData);
        
        // Extract roles from the access token
        const userRoles = extractRolesFromToken(authData.accessToken);
        const tokenUserInfo = extractUserInfoFromToken(authData.accessToken);
        
        // Store user roles
        storeUserRoles(userRoles);
        
        // Store user profile data with roles
        const userProfile = {
          keycloakId: authData.keycloakId,
          userId: authData.userId,
          username: authData.username,
          clients: authData.clients,
          name: authData.name || authData.username,
          email: authData.email || '',
          roles: userRoles,
          loginTime: new Date().toISOString()
        };
        storeUserData(userProfile);
        
        console.log('Extracted roles from token:', userRoles);
        console.log('Token user info:', tokenUserInfo);
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
      // Try to call logout endpoint if it exists
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT || '/auth/logout');
      
      // Clear stored data regardless of server response
      clearStoredAuthData();
      
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local data
      clearStoredAuthData();
      
      console.warn('Logout request failed, but local data cleared:', error.message);
      return { data: { success: true, message: 'Logged out successfully' } };
    }
  },

  /**
   * Sign out user (alias for logout)
   * @returns {Promise} - Axios response
   */
  signOut: async () => {
    return authAPI.logout();
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
      const authData = getStoredAuthData();
      if (!authData?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH || '/auth/refresh', {
        refreshToken: authData.refreshToken
      });
      
      if (response.data.success && response.data.data) {
        // Update stored auth data with new tokens
        const updatedAuthData = {
          ...authData,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken || authData.refreshToken,
          timestamp: Date.now()
        };
        storeAuthData(updatedAuthData);
      }
      
      return response;
    } catch (error) {
      // If refresh fails, clear auth data
      clearStoredAuthData();
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    const authData = getStoredAuthData();
    return !!(authData?.accessToken);
  },

  /**
   * Get stored user data
   * @returns {object|null} - User data or null
   */
  getStoredUser: () => {
    return getStoredUserData();
  },

  /**
   * Get stored auth token
   * @returns {string|null} - Auth token or null
   */
  getStoredToken: () => {
    const authData = getStoredAuthData();
    return authData?.accessToken || null;
  },

  /**
   * Get stored auth data
   * @returns {object|null} - Complete auth data or null
   */
  getStoredAuthData: () => {
    return getStoredAuthData();
  },

  /**
   * Clear all stored authentication data
   * @returns {boolean} - Success status
   */
  clearAuthData: () => {
    clearStoredAuthData();
    return true;
  },

  /**
   * Get stored user roles
   * @returns {Array} - Array of user roles
   */
  getStoredUserRoles: () => {
    return getStoredUserRoles();
  }
};

export default authAPI;
