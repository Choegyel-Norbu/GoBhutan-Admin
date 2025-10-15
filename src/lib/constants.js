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
    value: "1,234",
    description: "All active reservations",
    trend: "+12.5%"
  },
  {
    title: "Revenue",
    value: "$45,231",
    description: "This month's earnings",
    trend: "+8.2%"
  },
  {
    title: "Active Services",
    value: "5",
    description: "Available booking services",
    trend: "100%"
  },
  {
    title: "Customer Satisfaction",
    value: "98.5%",
    description: "Based on recent reviews",
    trend: "+2.1%"
  }
];

// API Configuration
export const API_BASE_URL = 'https://b7e96e42d904.ngrok-free.app';

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
