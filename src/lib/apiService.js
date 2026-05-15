import { API_CONFIG, buildApiUrl } from './api';
import { API_BASE_URL } from './constants';
import { getApiUrl } from './env';

// HTTP Client Configuration
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

const getStoredAccessToken = () => {
  try {
    const authData = JSON.parse(localStorage.getItem('gobhutan_auth_data'));
    return authData?.accessToken || null;
  } catch (error) {
    console.warn('Failed to read auth token from storage:', error);
    return null;
  }
};

// Create a simple HTTP client
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Process failed queue after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Refresh token method
  async refreshToken() {
    try {
      const authData = JSON.parse(localStorage.getItem('gobhutan_auth_data'));
      if (!authData?.refreshToken || !authData?.username) {
        throw new Error('No refresh token or username available');
      }

      // Prepare payload according to the API specification
      const refreshPayload = {
        username: authData.username,
        refreshToken: authData.refreshToken,
        client: authData.clients?.[0] || 'web' // Use first client or default to 'web'
      };

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(refreshPayload)
      });

      if (!response.ok) {
        // If refresh token returns 401, clear auth data and redirect to sign-in page
        if (response.status === 401) {
          localStorage.removeItem('gobhutan_auth_data');
          localStorage.removeItem('gobhutan_user_data');
          localStorage.removeItem('gobhutan_user_roles');
          console.warn('Refresh token expired. Redirecting to sign-in page.');
          window.location.href = `${import.meta.env.BASE_URL}signin`;
          return;
        }
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Handle response according to the API specification
      if (data.success && data.data) {
        // Update stored auth data with new tokens
        const updatedAuthData = {
          ...authData,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || authData.refreshToken,
          timestamp: Date.now()
        };
        localStorage.setItem('gobhutan_auth_data', JSON.stringify(updatedAuthData));
        
        // Update default headers with new token
        this.defaultHeaders['Authorization'] = `Bearer ${data.data.accessToken}`;
        
        console.log('Token refreshed successfully:', data.message);
        return data.data.accessToken;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      // Clear auth data if refresh fails
      localStorage.removeItem('gobhutan_auth_data');
      localStorage.removeItem('gobhutan_user_data');
      localStorage.removeItem('gobhutan_user_roles');
      console.error('Token refresh failed:', error.message);
      
      // If refresh token returns 401, redirect to sign-in page
      if (error.message?.includes('401') || error.status === 401) {
        console.warn('Refresh token expired. Redirecting to sign-in page.');
        window.location.href = `${import.meta.env.BASE_URL}signin`;
        return;
      }
      
      throw error;
    }
  }

  // Handle 401 Unauthorized responses
  async handleUnauthorized(endpoint, options) {
    if (this.isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(token => {
        return this.request(endpoint, { ...options, _retry: true });
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshToken();
      this.processQueue(null, newToken);
      
      // Retry the original request with new token
      return this.request(endpoint, { ...options, _retry: true });
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const latestAccessToken = getStoredAccessToken();
    const hasAuthHeaderInOptions =
      Object.prototype.hasOwnProperty.call(options?.headers || {}, 'Authorization');
    const hasAuthHeaderInDefault = Object.prototype.hasOwnProperty.call(this.defaultHeaders, 'Authorization');

    // Always sync Authorization header with the latest persisted token
    // so requests after user-switch/login do not carry stale tokens.
    if (!hasAuthHeaderInOptions) {
      if (latestAccessToken) {
        this.defaultHeaders['Authorization'] = `Bearer ${latestAccessToken}`;
      } else if (hasAuthHeaderInDefault) {
        delete this.defaultHeaders['Authorization'];
      }
    }
    
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };


    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401 Unauthorized with automatic token refresh
        if (response.status === 401 && !config._retry) {
          return this.handleUnauthorized(endpoint, options);
        }
        // Preserve API-provided message (e.g. {"message":"Insufficient wallet balance"})
        // so callers can show meaningful feedback instead of generic HTTP status errors.
        let apiMessage = '';
        const errorContentType = response.headers.get('content-type') || '';
        try {
          if (errorContentType.includes('application/json')) {
            const errorJson = await response.json();
            apiMessage = errorJson?.message || errorJson?.error || '';
          } else {
            const errorText = await response.text();
            apiMessage = errorText?.trim() || '';
          }
        } catch {
          apiMessage = '';
        }

        throw new Error(apiMessage || `HTTP error! status: ${response.status}`);
      }
      
      // For successful responses, handle different content types
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // Check if response has content
      if (contentLength === '0' || !contentType) {
        // Empty response body - return success indicator with status
        return { 
          success: true, 
          status: response.status,
          message: 'Operation completed successfully'
        };
      }
      
      if (contentType && contentType.includes('application/json')) {
        try {
          return await response.json();
        } catch (jsonError) {
          // If JSON parsing fails but response is successful, return success indicator
          console.warn('Failed to parse JSON response, but HTTP status is successful:', response.status);
          return { 
            success: true, 
            status: response.status,
            message: 'Operation completed successfully'
          };
        }
      }
      
      const textResponse = await response.text();
      
      // If text response is empty, return success indicator
      if (!textResponse || textResponse.trim() === '') {
        return { 
          success: true, 
          status: response.status,
          message: 'Operation completed successfully'
        };
      }
      
      return textResponse;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async postFormData(endpoint, formData, options = {}) {
    // For FormData, only keep non-content-type headers (let browser set Content-Type with boundary)
    const headers = {
      'ngrok-skip-browser-warning': 'true',
      ...(this.defaultHeaders['Authorization'] && { 'Authorization': this.defaultHeaders['Authorization'] }),
      ...options.headers,
    };
    
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });
  }

  async putFormData(endpoint, formData, options = {}) {
    // For FormData, only keep non-content-type headers (let browser set Content-Type with boundary)
    const headers = {
      'ngrok-skip-browser-warning': 'true',
      ...(this.defaultHeaders['Authorization'] && { 'Authorization': this.defaultHeaders['Authorization'] }),
      ...options.headers,
    };
    
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      headers,
      body: formData,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Set authorization token
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }
}

// Create default instance with environment-aware URL
const apiClient = new ApiClient(getApiUrl());

// Initialize with stored token if available
const initializeAuthToken = () => {
  try {
    const authData = JSON.parse(localStorage.getItem('gobhutan_auth_data'));
    if (authData?.accessToken) {
      apiClient.setAuthToken(authData.accessToken);
    }
  } catch (error) {
    console.warn('Failed to initialize auth token:', error);
  }
};

// Initialize auth token on module load
initializeAuthToken();

// Service-specific API methods
export const api = {
  // Dashboard
  dashboard: {
    getStats: () => apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.STATS),
    getRecentActivity: () => apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.RECENT_ACTIVITY),
  },

  // Authentication
  auth: {
    login: (credentials) => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
    logout: () => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
    signout: (signoutData) => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNOUT, signoutData),
    getProfile: () => apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE),
    refreshToken: () => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
    updateUser: (userData) => apiClient.put(API_CONFIG.ENDPOINTS.AUTH.UPDATE_USER, userData),
    updateProfile: (userData) => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, userData),
  },

  // Taxi Service
  taxi: {
    getBookings: () => apiClient.get(API_CONFIG.ENDPOINTS.TAXI.BOOKINGS),
    createBooking: (booking) => apiClient.post(API_CONFIG.ENDPOINTS.TAXI.BOOKINGS, booking),
    updateBooking: (id, booking) => apiClient.put(`${API_CONFIG.ENDPOINTS.TAXI.BOOKINGS}/${id}`, booking),
    deleteBooking: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.TAXI.BOOKINGS}/${id}`),
    getDrivers: () => apiClient.get(API_CONFIG.ENDPOINTS.TAXI.DRIVERS),
    getRoutes: () => apiClient.get(API_CONFIG.ENDPOINTS.TAXI.ROUTES),
  },

  // Hotel Service
  hotel: {
    getBookings: () => apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS),
    getBookingsCount: () => apiClient.get('/bookings/hotel/count'),
    createBooking: (booking) => apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS, booking),
    updateBooking: (id, booking) => apiClient.put(`${API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS}/${id}`, booking),
    deleteBooking: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS}/${id}`),
    getRooms: () => apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.ROOMS),
    getGuests: () => apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.GUESTS),
    createHotel: (hotelData) => apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.HOTELS, hotelData),
    getHotels: () => apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.HOTELS),
    updateHotel: (id, formData, deleteImageIds = []) => {
      // Build query string for deleteImageIds if provided
      let endpoint = `${API_CONFIG.ENDPOINTS.HOTEL.HOTELS}/updateHotel/${id}`;
      if (deleteImageIds.length > 0) {
        const params = new URLSearchParams();
        deleteImageIds.forEach(imageId => params.append('deleteImageIds', imageId));
        endpoint += `?${params.toString()}`;
      }
      return apiClient.putFormData(endpoint, formData);
    },
    deleteHotel: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.HOTEL.HOTELS}/${id}`),
    registerStaff: (staffData) => apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.REGISTER_STAFF, staffData),
  },

  // Room Service
  room: {
    getAllRooms: () => apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.ALL_ROOMS),
    getRoomsByHotel: (hotelId) => apiClient.get(`/api/rooms/hotel/${hotelId}`),
    getRoom: (roomId) => apiClient.get(`/api/rooms/${roomId}`),
    createRoom: (roomData) => apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.ALL_ROOMS, roomData),
    updateRoom: (roomId, roomData) => apiClient.put(`/api/rooms/${roomId}`, roomData),
    deleteRoom: (roomId) => apiClient.delete(`/api/rooms/${roomId}`),
  },

  // Flight Service
  flight: {
    getBookings: () => apiClient.get(API_CONFIG.ENDPOINTS.FLIGHT.BOOKINGS),
    createBooking: (booking) => apiClient.post(API_CONFIG.ENDPOINTS.FLIGHT.BOOKINGS, booking),
    updateBooking: (id, booking) => apiClient.put(`${API_CONFIG.ENDPOINTS.FLIGHT.BOOKINGS}/${id}`, booking),
    deleteBooking: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.FLIGHT.BOOKINGS}/${id}`),
    getRoutes: () => apiClient.get(API_CONFIG.ENDPOINTS.FLIGHT.ROUTES),
    getPassengers: () => apiClient.get(API_CONFIG.ENDPOINTS.FLIGHT.PASSENGERS),
  },

  // Movie Service
  movie: {
    getBookings: () => apiClient.get(API_CONFIG.ENDPOINTS.MOVIE.BOOKINGS),
    createBooking: (booking) => apiClient.post(API_CONFIG.ENDPOINTS.MOVIE.BOOKINGS, booking),
    updateBooking: (id, booking) => apiClient.put(`${API_CONFIG.ENDPOINTS.MOVIE.BOOKINGS}/${id}`, booking),
    deleteBooking: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.MOVIE.BOOKINGS}/${id}`),
    getShows: () => apiClient.get(API_CONFIG.ENDPOINTS.MOVIE.SHOWS),
    getTickets: () => apiClient.get(API_CONFIG.ENDPOINTS.MOVIE.TICKETS),
  },

  // Bus Service
  bus: {
    getRoutes: (busId = null) => {
      const endpoint = busId ? `${API_CONFIG.ENDPOINTS.BUS.ROUTES}/bus/${busId}` : API_CONFIG.ENDPOINTS.BUS.ROUTES;
      return apiClient.get(endpoint);
    },
    createRoute: (route) => apiClient.post(API_CONFIG.ENDPOINTS.BUS.ROUTES, route),
    updateRoute: (id, route) => apiClient.put(`${API_CONFIG.ENDPOINTS.BUS.ROUTES}/${id}`, route),
    deleteRoute: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.BUS.ROUTES}/${id}`),
    getSchedules: (busId = null) => {
      const endpoint = busId ? `${API_CONFIG.ENDPOINTS.BUS.SCHEDULES}/bus/${busId}` : API_CONFIG.ENDPOINTS.BUS.SCHEDULES;
      return apiClient.get(endpoint);
    },
    getSchedulesByRoute: (routeId) => {
      return apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.SCHEDULES}/route/${routeId}`);
    },
    getScheduleById: (id) => apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.SCHEDULES}/${id}`),
    deleteSchedule: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.BUS.SCHEDULES}/${id}`),
    toggleSchedule: (id) => apiClient.patch(`${API_CONFIG.ENDPOINTS.BUS.SCHEDULES}/${id}/toggle`),
    generateSchedules: (payload) => apiClient.post(`${API_CONFIG.ENDPOINTS.BUS.SCHEDULES}/bus/generate`, payload),
    getSchedulesByDateRange: (start, end, includeInactive = false) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.SCHEDULES}/date-range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&includeInactive=${includeInactive}`),
    getAvailableSchedulesForApp: (routeId, date) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.SCHEDULES}/app/route/${routeId}?date=${date}`),
    getRouteMasters: (activeOnly) => {
      const url = activeOnly !== undefined
        ? `${API_CONFIG.ENDPOINTS.BUS.BUS_MASTERS}?activeOnly=${activeOnly}`
        : API_CONFIG.ENDPOINTS.BUS.BUS_MASTERS;
      return apiClient.get(url);
    },
    createRouteMaster: (payload) => apiClient.post(API_CONFIG.ENDPOINTS.BUS.BUS_MASTERS, payload),
    updateRouteMaster: (id, payload) => apiClient.put(`${API_CONFIG.ENDPOINTS.BUS.BUS_MASTERS}/${id}`, payload),
    disableRouteMaster: (id) => apiClient.patch(`${API_CONFIG.ENDPOINTS.BUS.BUS_MASTERS}/${id}/disable`),
    getBuses: () => apiClient.get(API_CONFIG.ENDPOINTS.BUS.BUSES),
    getBus: (busId) => apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.BUSES}/bus/${busId}`),
    createBus: (bus) => apiClient.post(API_CONFIG.ENDPOINTS.BUS.BUSES, bus),
    updateBus: (id, bus) => apiClient.put(`${API_CONFIG.ENDPOINTS.BUS.BUSES}/${id}`, bus),
    deleteBus: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.BUS.BUSES}/${id}`),
    searchActiveRoutes: (source, destination, date) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.ROUTES}/active/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}${date ? `&date=${date}` : ''}`),
    getActiveBuses: () => apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.BUSES}/active`),
    getScheduleSeats: (scheduleId) => {
      return apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.SCHEDULE_SEATS}/${scheduleId}/seats`);
    },
    getSeatConfigs: (busId) => {
      return apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.BUSES}/${busId}/seat-configs`);
    },
    generateSeats: (busId) => {
      return apiClient.post(`${API_CONFIG.ENDPOINTS.BUS.GENERATE_SEATS}/${busId}/seat-configs/generate-seats`);
    },
    lockBooking: (bookingData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.BUS.BOOKING_LOCK, bookingData),
    /** POST `/api/bookings/confirm` — include `walletSettlement: true` (+ optional `amount`/`currency`) when the server should debit wallet balance then confirm the lock. */
    confirmBooking: (payload) =>
      apiClient.post(API_CONFIG.ENDPOINTS.BUS.BOOKING_CONFIRM, payload),
    payBooking: (payload) =>
      apiClient.post(API_CONFIG.ENDPOINTS.BUS.BOOKING_PAY, payload),
    cancelBooking: (bookingId) =>
      apiClient.post(`${API_CONFIG.ENDPOINTS.BUS.BOOKING_CANCEL}/${bookingId}`),
    getBookingTicket: (bookingId) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.BOOKING_TICKET}/${bookingId}`),
    getBookingManifest: (scheduleId) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.BOOKING_MANIFEST}/${scheduleId}/manifest`),
    lockCashBooking: (bookingData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.BUS.BOOKING_CASH_LOCK, bookingData),
    confirmCashBooking: (payload) =>
      apiClient.post(API_CONFIG.ENDPOINTS.BUS.BOOKING_CASH_CONFIRM, payload),
    cancelCashBooking: (bookingId) =>
      apiClient.post(`${API_CONFIG.ENDPOINTS.BUS.BOOKING_CASH_CANCEL}/${bookingId}`),
    getCashTicket: (bookingId) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.BUS.BOOKING_CASH_TICKET}/${bookingId}`),
  },

  // Wallet Service
  wallet: {
    getBalance: () => apiClient.get('/api/payment-int/wallet/balance'),
    initiateTopup: (payload) => apiClient.post('/api/payment-int/wallet/topup/initiate', payload),
    accountInquiryTopup: (payload) => apiClient.post('/api/payment-int/wallet/topup/account-inquiry', payload),
    debitTopup: (payload) => apiClient.post('/api/payment-int/wallet/topup/debit', payload),
    getLedger: () => apiClient.get('/api/payment-int/wallet/ledger'),
  },
};

// Export the client instance for custom requests
export { apiClient };
export default api;
