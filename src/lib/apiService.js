import { API_CONFIG, buildApiUrl } from './api';
import { API_BASE_URL } from './constants';
import { getApiUrl } from './env';

// HTTP Client Configuration
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

// Create a simple HTTP client
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    // Add ngrok header for all requests
    config.headers['ngrok-skip-browser-warning'] = 'true';

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
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
    getProfile: () => apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE),
    refreshToken: () => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
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
    createBooking: (booking) => apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS, booking),
    updateBooking: (id, booking) => apiClient.put(`${API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS}/${id}`, booking),
    deleteBooking: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS}/${id}`),
    getRooms: () => apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.ROOMS),
    getGuests: () => apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.GUESTS),
    createHotel: (hotelData) => apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.HOTELS, hotelData),
    getHotels: () => apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.HOTELS),
    updateHotel: (id, hotelData) => apiClient.put(`${API_CONFIG.ENDPOINTS.HOTEL.HOTELS}/${id}`, hotelData),
    deleteHotel: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.HOTEL.HOTELS}/${id}`),
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
    getBookings: () => apiClient.get(API_CONFIG.ENDPOINTS.BUS.BOOKINGS),
    createBooking: (booking) => apiClient.post(API_CONFIG.ENDPOINTS.BUS.BOOKINGS, booking),
    updateBooking: (id, booking) => apiClient.put(`${API_CONFIG.ENDPOINTS.BUS.BOOKINGS}/${id}`, booking),
    deleteBooking: (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.BUS.BOOKINGS}/${id}`),
    getRoutes: () => apiClient.get(API_CONFIG.ENDPOINTS.BUS.ROUTES),
    getSchedules: () => apiClient.get(API_CONFIG.ENDPOINTS.BUS.SCHEDULES),
  },
};

// Export the client instance for custom requests
export { apiClient };
export default api;
