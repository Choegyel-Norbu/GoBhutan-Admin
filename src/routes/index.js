import { 
  LayoutDashboard, 
  Car, 
  Building2, 
  Plane, 
  Film, 
  Bus,
  Calendar,
  Users,
  BarChart3,
  Plus,
  Settings,
  Building,
  Bed,
  MapPin
} from 'lucide-react';

export const navigationItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics',
    clients: ['hotel', 'bus'] // Available to all clients
  },
  {
    title: 'Taxi Service',
    path: '/dashboard/taxi',
    icon: Car,
    description: 'Taxi booking management',
    clients: ['taxi'] // Only for taxi clients
  },
  {
    title: 'Hotels',
    path: '/dashboard/hotel',
    icon: Building2,
    description: 'Hotel management',
    clients: ['hotel'], // Only for hotel clients
    subcategories: [
      {
        title: 'Register Hotel',
        path: '/dashboard/hotel/add',
        icon: Building,
        description: 'Register new hotel to system',
        clients: ['hotel']
      },
      {
        title: 'Room Management',
        path: '/dashboard/hotel/add-rooms',
        icon: Bed,
        description: 'Manage rooms for existing hotels',
        clients: ['hotel']
      },
      {
        title: 'Booking Management',
        path: '/dashboard/hotel/book',
        icon: Plus,
        description: 'Manage hotel bookings and reservations',
        clients: ['hotel']
      },
      {
        title: 'Hotel Settings',
        path: '/dashboard/hotel/settings',
        icon: Settings,
        description: 'Configure hotel preferences and details',
        clients: ['hotel']
      }
    ]
  },
  {
    title: 'Flights',
    path: '/dashboard/flight',
    icon: Plane,
    description: 'Flight bookings',
    clients: ['flight'] // Only for flight clients
  },
  {
    title: 'Movie Tickets',
    path: '/dashboard/movie-ticketing',
    icon: Film,
    description: 'Movie ticket reservations',
    clients: ['movie'] // Only for movie clients
  },
  {
    title: 'Bus',
    path: '/dashboard/bus',
    icon: Bus,
    description: 'Bus management',
    clients: ['bus'], // Only for bus clients
    subcategories: [
      {
        title: 'Register Bus',
        path: '/dashboard/bus/add',
        icon: Plus,
        description: 'Register new bus to system',
        clients: ['bus']
      },
      {
        title: 'Bus Management',
        path: '/dashboard/bus/manage',
        icon: Bus,
        description: 'Manage existing buses',
        clients: ['bus']
      },
      {
        title: 'Booking Management',
        path: '/dashboard/bus/booking',
        icon: Calendar,
        description: 'Manage bus bookings and reservations',
        clients: ['bus']
      },
      {
        title: 'Bus Settings',
        path: '/dashboard/bus/settings',
        icon: Settings,
        description: 'Configure bus preferences and details',
        clients: ['bus']
      }
    ]
  }
];

export const quickActions = [
  {
    title: 'View Calendar',
    icon: Calendar,
    action: 'calendar'
  },
  {
    title: 'Manage Users',
    icon: Users,
    action: 'users'
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    action: 'analytics'
  }
];

export default navigationItems;
