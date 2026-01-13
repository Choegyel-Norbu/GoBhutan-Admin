// Environment Configuration
const getEnvVar = (key, defaultValue) => {
  return import.meta.env[key] || defaultValue;
};

export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://gobhutan.site/boot'),

  // App Configuration
  APP_NAME: getEnvVar('VITE_APP_NAME', 'GoBhutan'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),

  // Development Settings
  DEBUG: getEnvVar('VITE_DEBUG', 'true') === 'true',
  LOG_LEVEL: getEnvVar('VITE_LOG_LEVEL', 'debug'),

  // Environment Detection
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  IS_PREVIEW: import.meta.env.MODE === 'preview',
};

// API URLs for environments
// Use environment variable with fallback
const DEFAULT_API_URL = 'https://gobhutan.site/boot';

export const API_URLS = {
  DEVELOPMENT: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL,
  STAGING: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL,
  PRODUCTION: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL,
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  // Always use the environment variable if available, otherwise use default
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL;
};

export default ENV_CONFIG;
