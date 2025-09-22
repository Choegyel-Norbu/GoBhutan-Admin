// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://a2fa2c6258e2.ngrok-free.app',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/signin',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
    },
    
    // Dashboard
    DASHBOARD: {
      STATS: '/dashboard/stats',
      RECENT_ACTIVITY: '/dashboard/activity',
    },
    
    // Services
    TAXI: {
      BOOKINGS: '/taxi/bookings',
      DRIVERS: '/taxi/drivers',
      ROUTES: '/taxi/routes',
    },
    
    HOTEL: {
      BOOKINGS: '/hotel/bookings',
      ROOMS: '/hotel/rooms',
      GUESTS: '/hotel/guests',
    },
    
    FLIGHT: {
      BOOKINGS: '/flight/bookings',
      ROUTES: '/flight/routes',
      PASSENGERS: '/flight/passengers',
    },
    
    MOVIE: {
      BOOKINGS: '/movie/bookings',
      SHOWS: '/movie/shows',
      TICKETS: '/movie/tickets',
    },
    
    BUS: {
      BOOKINGS: '/bus/bookings',
      ROUTES: '/bus/routes',
      SCHEDULES: '/bus/schedules',
    },
  },
  
  // Request Configuration
  DEFAULT_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint by service and action
export const getEndpoint = (service, action) => {
  return API_CONFIG.ENDPOINTS[service.toUpperCase()]?.[action.toUpperCase()];
};

export default API_CONFIG;
