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
  Search,
  Edit,
  Trash2,
  Eye,
  Settings,
  FileText,
  Building,
  Bed
} from 'lucide-react';

export const navigationItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    title: 'Taxi Service',
    path: '/dashboard/taxi',
    icon: Car,
    description: 'Taxi booking management'
  },
  {
    title: 'Hotels',
    path: '/dashboard/hotel',
    icon: Building2,
    description: 'Hotel management',
    subcategories: [
      {
        title: 'Add Hotel',
        path: '/dashboard/hotel/add',
        icon: Building,
        description: 'Add new hotel to system'
      },
      {
        title: 'Add Rooms',
        path: '/dashboard/hotel/add-rooms',
        icon: Bed,
        description: 'Add rooms to existing hotels'
      },
      {
        title: 'Book Hotel',
        path: '/dashboard/hotel/book',
        icon: Plus,
        description: 'Create new hotel bookings'
      },
      {
        title: 'Search Hotels',
        path: '/dashboard/hotel/search',
        icon: Search,
        description: 'Find available hotels'
      },
      {
        title: 'View Bookings',
        path: '/dashboard/hotel/bookings',
        icon: Eye,
        description: 'View all hotel reservations'
      },
      {
        title: 'Edit Bookings',
        path: '/dashboard/hotel/edit',
        icon: Edit,
        description: 'Modify existing bookings'
      },
      {
        title: 'Cancel Bookings',
        path: '/dashboard/hotel/cancel',
        icon: Trash2,
        description: 'Cancel hotel reservations'
      },
      {
        title: 'Hotel Settings',
        path: '/dashboard/hotel/settings',
        icon: Settings,
        description: 'Configure hotel preferences'
      },
      {
        title: 'Reports',
        path: '/dashboard/hotel/reports',
        icon: FileText,
        description: 'Generate booking reports'
      }
    ]
  },
  {
    title: 'Flights',
    path: '/dashboard/flight',
    icon: Plane,
    description: 'Flight bookings'
  },
  {
    title: 'Movie Tickets',
    path: '/dashboard/movie-ticketing',
    icon: Film,
    description: 'Movie ticket reservations'
  },
  {
    title: 'Bus Tickets',
    path: '/dashboard/bus-ticket-booking',
    icon: Bus,
    description: 'Bus ticket bookings'
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
