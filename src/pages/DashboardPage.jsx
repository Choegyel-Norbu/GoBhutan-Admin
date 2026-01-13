import { Calendar, TrendingUp, Building2, Bus, Plus, Settings, Bed, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { STAT_CARDS } from '@/lib/constants';

function DashboardPage() {
  const navigate = useNavigate();

  // Only implemented services: Bus and Hotel
  const implementedServices = [
    {
      title: 'Bus Management',
      path: '/dashboard/bus/manage',
      icon: Bus,
      description: 'Manage your bus fleet, routes, and schedules',
      color: 'bg-blue-500/10 text-blue-600',
      actions: [
        { label: 'Add Bus', path: '/dashboard/bus/add', icon: Plus },
        { label: 'Manage Buses', path: '/dashboard/bus/manage', icon: Bus },
        { label: 'Settings', path: '/dashboard/bus/settings', icon: Settings }
      ]
    },
    {
      title: 'Hotel Management',
      path: '/dashboard/hotel',
      icon: Building2,
      description: 'Manage hotels, rooms, and bookings',
      color: 'bg-green-500/10 text-green-600',
      actions: [
        { label: 'Add Hotel', path: '/dashboard/hotel/add', icon: Plus },
        { label: 'Room Management', path: '/dashboard/hotel/add-rooms', icon: Bed },
        { label: 'Settings', path: '/dashboard/hotel/settings', icon: Settings }
      ]
    }
  ];

  return (
    <PageWrapper 
      title="Dashboard" 
      description="Welcome to GoBhutan admin panel. Manage your bus and hotel services."
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat, index) => {
          const icons = [Calendar, TrendingUp, Building2, Bus];
          const Icon = icons[index];
          return (
            <DashboardCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              trend={stat.trend}
              icon={Icon}
            />
          );
        })}
      </div>

      {/* Services Overview - Only Implemented Services */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base md:text-lg">Services</CardTitle>
          <CardDescription className="text-sm">
            Manage your bus and hotel services
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
            {implementedServices.map((service) => {
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
                    <div className="grid grid-cols-3 gap-2">
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

      {/* Quick Access */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base md:text-lg">Quick Access</CardTitle>
          <CardDescription className="text-sm">
            Frequently used actions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/bus/add')}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Bus</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/bus/manage')}
            >
              <Bus className="h-5 w-5" />
              <span className="text-sm font-medium">Manage Buses</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/hotel/add')}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Hotel</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/hotel/add-rooms')}
            >
              <Bed className="h-5 w-5" />
              <span className="text-sm font-medium">Manage Rooms</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default DashboardPage;
