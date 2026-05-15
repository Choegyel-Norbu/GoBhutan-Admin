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
      UPDATE_PROFILE: '/auth/update-profile',
      FORGOT_PASSWORD_SEND_OTP: '/auth/forgot-password/send-otp',
      FORGOT_PASSWORD_VERIFY_OTP: '/auth/forgot-password/verify-otp',
      FORGOT_PASSWORD_RESET: '/auth/forgot-password/reset',
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
      ALL_ROOMS: '/api/rooms',
      ROOM_TYPES: '/api/room-types',
      ROOM_TYPES_BY_HOTEL: '/api/room-types',
      REGISTER_STAFF: '/auth/staff/create',
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
      ROUTES: '/api/bus-routes',
      SCHEDULES: '/api/schedules',
      BUSES: '/api/buses',
      BUS_MASTERS: '/api/bus-masters/routes',
      /** GET `{SCHEDULE_SEATS}/{scheduleId}/seats` → `/api/bookings/schedule/{scheduleId}/seats` */
      SCHEDULE_SEATS: '/api/bookings/schedule',
      GENERATE_SEATS: '/api/buses',
      /** Bus (and shared) seat lock — POST body: scheduleId, seatNumbers, seatLabels, applicant*, status */
      BOOKING_LOCK: '/api/bookings/lock',
      /** POST `{ bookingRef }` */
      BOOKING_CONFIRM: '/api/bookings/confirm',
      /** GET `/api/bookings/ticket/{bookingId}` */
      BOOKING_TICKET: '/api/bookings/ticket',
      /** POST `/api/bookings/pay` */
      BOOKING_PAY: '/api/bookings/pay',
      /** POST `/api/bookings/cancel/{bookingId}` */
      BOOKING_CANCEL: '/api/bookings/cancel',
      /** GET `/api/bookings/admin/schedule/{id}/manifest` */
      BOOKING_MANIFEST: '/api/bookings/admin/schedule',
      /** Admin cash booking endpoints */
      BOOKING_CASH_LOCK: '/api/bookings/admin/cash/lock',
      BOOKING_CASH_CONFIRM: '/api/bookings/admin/cash/confirm',
      BOOKING_CASH_CANCEL: '/api/bookings/admin/cash/cancel',
      BOOKING_CASH_TICKET: '/api/bookings/admin/cash/ticket',
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
