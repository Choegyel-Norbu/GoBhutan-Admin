import { Calendar, Building2, Bus, Plus, Bed, Car, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId || user?.keycloakId || null;
  const { stats, loading } = useDashboard(userId);

  // Helper to check if user has access to a service
  const hasAccess = (serviceType) => {
    if (!user) return false;
    const roles = user.roles || [];
    const clients = user.clients || [];
    
    // Admin has access to everything
    if (roles.includes('admin') || roles.includes('superuser')) return true;
    
    // Special handling for movie/theater - they're the same service
    if (serviceType === 'movie') {
      const hasMovieAccess = 
        roles.some(r => {
          const role = r.toLowerCase();
          return role.includes('movie') || role.includes('theater') || role.includes('cinema');
        }) ||
        clients.some(c => {
          const client = c.toLowerCase();
          return client.includes('movie') || client.includes('theater') || client.includes('cinema');
        });
      return hasMovieAccess;
    }
    
    // Check for specific service access in roles or clients
    // We look for keywords like 'bus', 'hotel', 'taxi' in roles or client strings
    const hasServiceRole = roles.some(r => r.toLowerCase().includes(serviceType.toLowerCase()));
    const hasServiceClient = clients.some(c => c.toLowerCase().includes(serviceType.toLowerCase()));
    
    return hasServiceRole || hasServiceClient;
  };

  // All available services - dynamically filtered based on user access
  const allServices = [
    {
      id: 'bus',
      title: 'Bus Management',
      path: '/dashboard/bus/manage',
      icon: Bus,
      description: 'Manage your bus fleet, routes, and schedules',
      color: 'bg-blue-500/10 text-blue-600',
      actions: [
        { label: 'Add Bus', path: '/dashboard/bus/add', icon: Plus },
        { label: 'Manage Buses', path: '/dashboard/bus/manage', icon: Bus }
      ]
    },
    {
      id: 'hotel',
      title: 'Hotel Management',
      path: '/dashboard/hotel',
      icon: Building2,
      description: 'Manage hotels, rooms, and bookings',
      color: 'bg-green-500/10 text-green-600',
      actions: [
        { label: 'Add Hotel', path: '/dashboard/hotel/add', icon: Plus },
        { label: 'Room Management', path: '/dashboard/hotel/add-rooms', icon: Bed }
      ]
    },
    {
      id: 'taxi',
      title: 'Taxi Service',
      path: '/dashboard/taxi',
      icon: Car,
      description: 'Manage taxi bookings and ride requests',
      color: 'bg-yellow-500/10 text-yellow-600',
      actions: [
        { label: 'View Bookings', path: '/dashboard/taxi', icon: Car },
        { label: 'Manage Rides', path: '/dashboard/taxi', icon: Car }
      ]
    },
    {
      id: 'movie',
      title: 'Movie Ticketing',
      path: '/dashboard/movie-ticketing',
      icon: Film,
      description: 'Manage movie ticket bookings and cinema reservations',
      color: 'bg-purple-500/10 text-purple-600',
      actions: [
        { label: 'View Bookings', path: '/dashboard/movie-ticketing', icon: Film },
        { label: 'Manage Shows', path: '/dashboard/movie-ticketing', icon: Film }
      ]
    }
  ];

  // Filter services based on user access
  const visibleServices = allServices.filter(service => hasAccess(service.id));

  // Dynamic stats cards
  const dashboardStats = [
    {
      title: "Total Bookings",
      value: loading ? "..." : (stats?.totalBookings || "0"),
      description: "All active reservations",
      trend: null,
      icon: Calendar
    },
    {
      title: "Total Hotels",
      value: loading ? "..." : (stats?.totalHotels || "0"),
      description: "Hotels in system",
      trend: null,
      icon: Building2
    },
    {
      title: "Active Services",
      value: visibleServices.length.toString(),
      description: "Services you manage",
      trend: null,
      icon: Building2
    },
    {
      title: "Total Buses",
      value: loading ? "..." : (stats?.totalBuses || "0"),
      description: "Buses in fleet",
      trend: null,
      icon: Bus
    }
  ];

  return (
    <PageWrapper 
      title="Dashboard" 
      description={`Welcome back, ${user?.name || 'Admin'}. Manage your services.`}
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Services Overview - Only Visible Services */}
      {visibleServices.length > 0 ? (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg">Services</CardTitle>
            <CardDescription className="text-sm">
              Manage your available services
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
              {visibleServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Card key={service.path} className="border-2 hover:border-primary/50 transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${service.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{service.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {service.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {service.actions.map((action) => {
                          const ActionIcon = action.icon;
                          return (
                            <Button
                              key={action.path}
                              variant="outline"
                              size="sm"
                              className="flex flex-col gap-1 h-auto py-3"
                              onClick={() => navigate(action.path)}
                            >
                              <ActionIcon className="h-4 w-4" />
                              <span className="text-xs">{action.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No services available. Please contact support to enable services for your account.
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}

export default DashboardPage;
