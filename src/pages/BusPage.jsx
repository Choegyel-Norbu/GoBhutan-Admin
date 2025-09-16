import { Bus, MapPin, Clock, Users } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DashboardCard from '@/components/DashboardCard';

function BusPage() {
  return (
    <PageWrapper 
      title="Bus Ticket Booking" 
      description="Manage bus ticket reservations and route schedules."
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active Routes"
          value="12"
          description="Operating today"
          trend="+2"
          icon={MapPin}
        />
        <DashboardCard
          title="Tickets Sold"
          value="89"
          description="Today's bookings"
          trend="+22%"
          icon={Users}
        />
        <DashboardCard
          title="Next Departure"
          value="15 min"
          description="Route to Thimphu"
          icon={Clock}
        />
        <DashboardCard
          title="Fleet Status"
          value="8/10"
          description="Buses operational"
          trend="80%"
          icon={Bus}
        />
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Bus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bus Ticketing System</CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Comprehensive bus booking platform coming soon! Manage routes, 
            schedules, seat reservations, and passenger tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Features in development:
            </p>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">🚌 Route Planning</div>
              <div className="p-3 bg-muted rounded-lg">🎫 Online Booking</div>
              <div className="p-3 bg-muted rounded-lg">📍 Live Tracking</div>
              <div className="p-3 bg-muted rounded-lg">💺 Seat Selection</div>
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

export default BusPage;
