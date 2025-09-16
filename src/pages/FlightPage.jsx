import { Plane, MapPin, Clock, Users } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DashboardCard from '@/components/DashboardCard';

function FlightPage() {
  return (
    <PageWrapper 
      title="Flight Bookings" 
      description="Manage flight reservations and travel arrangements for your guests."
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active Bookings"
          value="45"
          description="Confirmed flights"
          trend="+12%"
          icon={Plane}
        />
        <DashboardCard
          title="Departures Today"
          value="8"
          description="Scheduled flights"
          trend="+2"
          icon={Clock}
        />
        <DashboardCard
          title="Passengers"
          value="127"
          description="Flying today"
          trend="+18%"
          icon={Users}
        />
        <DashboardCard
          title="Destinations"
          value="23"
          description="Cities served"
          trend="+3"
          icon={MapPin}
        />
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Plane className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Flight Booking System</CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Comprehensive flight booking platform coming soon! Search flights, 
            compare prices, manage reservations, and handle travel documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Features in development:
            </p>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">✈️ Flight Search</div>
              <div className="p-3 bg-muted rounded-lg">💺 Seat Selection</div>
              <div className="p-3 bg-muted rounded-lg">📄 E-tickets</div>
              <div className="p-3 bg-muted rounded-lg">🧳 Baggage Tracking</div>
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

export default FlightPage;
