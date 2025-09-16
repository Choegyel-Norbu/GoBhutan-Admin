import { Film, Calendar, Users, Ticket } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DashboardCard from '@/components/DashboardCard';

function MoviePage() {
  return (
    <PageWrapper 
      title="Movie Ticketing" 
      description="Manage movie ticket bookings and cinema reservations."
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Today's Shows"
          value="24"
          description="Movie screenings"
          trend="+3"
          icon={Film}
        />
        <DashboardCard
          title="Tickets Sold"
          value="342"
          description="This week"
          trend="+15%"
          icon={Ticket}
        />
        <DashboardCard
          title="Occupancy Rate"
          value="78%"
          description="Average this month"
          trend="+5%"
          icon={Users}
        />
        <DashboardCard
          title="Showtimes"
          value="6"
          description="Peak hours today"
          trend="+2"
          icon={Calendar}
        />
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Film className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Movie Ticketing System</CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Complete cinema management system coming soon! Handle movie schedules, 
            seat bookings, concessions, and digital ticket delivery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Features in development:
            </p>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">🎬 Movie Listings</div>
              <div className="p-3 bg-muted rounded-lg">💺 Seat Selection</div>
              <div className="p-3 bg-muted rounded-lg">🍿 Concessions</div>
              <div className="p-3 bg-muted rounded-lg">🎫 Digital Tickets</div>
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

export default MoviePage;
