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
  MapPin,
  Home,
  UserCog,
  Clapperboard,
  Grid3x3
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
        title: 'Room Types',
        path: '/dashboard/hotel/room-types',
        icon: Home,
        description: 'Manage room types and configurations',
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
      }
    ]
  },
  {
    title: 'Theater',
    path: '/dashboard/theater',
    icon: Clapperboard,
    description: 'Theater management',
    clients: ['theater', 'movie'], // Available for theater and movie clients
    subcategories: [
      {
        title: 'Registration',
        path: '/dashboard/theater/add',
        icon: Building,
        description: 'Register new theater to system',
        clients: ['theater']
      },
      {
        title: 'Seat Config',
        path: '/dashboard/theater/sitconfig',
        icon: Grid3x3,
        description: 'Configure theater seat layout',
        clients: ['theater']
      },
      {
        title: 'Movie',
        path: '/dashboard/theater/movie',
        icon: Film,
        description: 'Register and manage movies',
        clients: ['theater', 'movie'] // Available for both theater and movie clients
      }
    ]
  },
  {
    title: 'Settings',
    path: '/dashboard/settings',
    icon: Settings,
    description: 'Manage user profile and preferences',
    clients: ['hotel', 'bus', 'taxi', 'flight', 'movie', 'theater'] // Available to all clients
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
