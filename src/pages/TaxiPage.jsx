import { Car, MapPin, Clock, Users } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DashboardCard from '@/components/DashboardCard';

function TaxiPage() {
  return (
    <PageWrapper 
      title="Taxi Service" 
      description="Manage taxi bookings and ride requests for your guests."
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active Rides"
          value="12"
          description="Currently ongoing"
          trend="+2"
          icon={Car}
        />
        <DashboardCard
          title="Today's Bookings"
          value="34"
          description="Scheduled rides"
          trend="+18%"
          icon={Clock}
        />
        <DashboardCard
          title="Available Drivers"
          value="8"
          description="Online now"
          trend="67%"
          icon={Users}
        />
        <DashboardCard
          title="Total Distance"
          value="245 km"
          description="Covered today"
          trend="+12 km"
          icon={MapPin}
        />
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Taxi Service Management</CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Comprehensive taxi booking system coming soon! This will include real-time tracking, 
            driver management, fare calculation, and customer ride history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Features in development:
            </p>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">🚗 Fleet Management</div>
              <div className="p-3 bg-muted rounded-lg">📍 GPS Tracking</div>
              <div className="p-3 bg-muted rounded-lg">💰 Fare Calculator</div>
              <div className="p-3 bg-muted rounded-lg">📱 Driver App</div>
            </div>
            <div className="pt-4">
              <Button size="lg">
                Get Notified When Ready
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default TaxiPage;
