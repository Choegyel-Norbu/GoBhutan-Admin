// Environment Configuration
const getEnvVar = (key, defaultValue) => {
  return import.meta.env[key] || defaultValue;
};

export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://b7e96e42d904.ngrok-free.app'),
  
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
export const API_URLS = {
  DEVELOPMENT: 'https://b7e96e42d904.ngrok-free.app',
  STAGING: 'https://b7e96e42d904.ngrok-free.app',
  PRODUCTION: 'https://b7e96e42d904.ngrok-free.app',
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  const mode = import.meta.env.MODE;
  
  switch (mode) {
    case 'development':
      return API_URLS.DEVELOPMENT;
    case 'preview':
      return API_URLS.STAGING;
    case 'production':
      return API_URLS.PRODUCTION;
    default:
      return API_URLS.DEVELOPMENT;
  }
};

export default ENV_CONFIG;
