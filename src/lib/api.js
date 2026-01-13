// API Configuration
// Use environment variable with fallback to production API URL
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'https://gobhutan.site/boot';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/signin',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
      SIGNOUT: '/auth/signout',
      REFRESH: '/auth/refresh-token',
      PROFILE: '/auth/profile',
      UPDATE_USER: '/auth/update-user',
      UPDATE_CLIENTS: '/auth/update-clients',
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
      HOTELS: '/api/v1/hotels',
      ALL_ROOMS: '/rooms',
      ROOM_TYPES: '/api/room-types',
      ROOM_TYPES_BY_HOTEL: '/api/room-types/hotel',
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
      ROUTES: '/api/bus-routes',
      SCHEDULES: '/api/schedules',
      BUSES: '/api/buses',
      AVAILABLE_SEATS: '/bus/bookings/schedule',
      GENERATE_SEATS: '/api/buses',
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
