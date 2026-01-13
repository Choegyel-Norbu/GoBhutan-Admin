export const APP_NAME = "GoBhutan Admin";

export const ROUTES = {
  DASHBOARD: "/dashboard",
  TAXI: "/dashboard/taxi",
  HOTEL: "/dashboard/hotel",
  FLIGHT: "/dashboard/flight",
  MOVIE: "/dashboard/movie-ticketing",
  BUS: "/dashboard/bus",
};

export const STAT_CARDS = [
  {
    title: "Total Bookings",
    value: "0",
    description: "All active reservations",
    trend: null
  },
  {
    title: "Revenue",
    value: "BTN 0",
    description: "This month's earnings",
    trend: null
  },
  {
    title: "Active Services",
    value: "2",
    description: "Bus & Hotel services",
    trend: null
  },
  {
    title: "Total Buses",
    value: "0",
    description: "Buses in fleet",
    trend: null
  }
];

// API Configuration
// Use environment variable with fallback to production API URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gobhutan.site/boot';

// Environment Configuration
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  CURRENT: import.meta.env.MODE || 'development',
};

// App Configuration
export const APP_CONFIG = {
  VERSION: '1.0.0',
  AUTHOR: 'GoBhutan',
  DESCRIPTION: 'Comprehensive reservation management system',
};

// Recurrence Type Enum
// Used for bus schedule recurrence patterns
export const RecurrenceType = {
  DAILY: 'DAILY',          // Bus runs every day
  ALTERNATE: 'ALTERNATE',  // Bus runs every 2 days
  CUSTOM: 'CUSTOM'         // Uses Bus.operatingDays set (manual)
};

// Layout Type Options
// Seat layout configurations (e.g., "1+2" = 1 seat on left, 2 on right)
export const LAYOUT_TYPES = [
  { value: '1+2', label: '1+2 (19 seats)', seats: 19 },
  { value: '2+2', label: '2+2 (32 seats)', seats: 32 },
  { value: '2+3', label: '2+3 (40 seats)', seats: 40 },
];
