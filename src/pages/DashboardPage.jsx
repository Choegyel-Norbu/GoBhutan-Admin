import { Calendar, Users, DollarSign, BarChart3, Car, Building2, Plane, Film, Bus } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { STAT_CARDS } from '@/lib/constants';
import { quickActions, navigationItems } from '@/routes';

function DashboardPage() {
  const serviceCards = navigationItems.slice(1); // Exclude dashboard itself

  return (
    <PageWrapper 
      title="Dashboard" 
      description="Welcome to GoBhutan admin panel. Monitor your bookings and manage all services from here."
    >
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat, index) => {
          const icons = [Calendar, DollarSign, Users, BarChart3];
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions for managing your reservations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Services Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Access all available booking services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.path}
                  className="group relative overflow-hidden rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                      <div className="mt-4">
                        <span className="text-sm text-primary font-medium group-hover:underline">
                          Manage bookings →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest bookings and updates across all services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Hotel', action: 'New booking', time: '2 minutes ago', user: 'Sarah Johnson' },
              { type: 'Taxi', action: 'Ride completed', time: '1 hour ago', user: 'Michael Chen' },
              { type: 'Flight', action: 'Booking confirmed', time: '3 hours ago', user: 'Emma Davis' },
              { type: 'Movie', action: 'Tickets purchased', time: '5 hours ago', user: 'David Wilson' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> - {activity.action} for{' '}
                    <span className="font-medium text-primary">{activity.type}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default DashboardPage;
