import { Building2, Bed, Users, Calendar } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DashboardCard from '@/components/DashboardCard';

function HotelPage() {
  return (
    <PageWrapper 
      title="Hotel Reservations" 
      description="Manage hotel bookings, room availability, and guest services."
    >
      {/* Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Occupied Rooms"
          value="87/120"
          description="72% occupancy"
          trend="+5%"
          icon={Bed}
        />
        <DashboardCard
          title="Check-ins Today"
          value="23"
          description="Arrivals scheduled"
          trend="+12%"
          icon={Calendar}
        />
        <DashboardCard
          title="Total Guests"
          value="156"
          description="Currently staying"
          trend="+8"
          icon={Users}
        />
        <DashboardCard
          title="Revenue Today"
          value="$4,250"
          description="Room bookings"
          trend="+15%"
          icon={Building2}
        />
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center py-8 md:py-12">
        <CardHeader className="pb-4">
          <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
            <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <CardTitle className="text-lg md:text-2xl">Hotel Management System</CardTitle>
          <CardDescription className="text-sm md:text-lg max-w-2xl mx-auto">
            Complete hotel reservation system coming soon! Manage rooms, bookings, 
            guest services, and housekeeping all in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 md:space-y-4">
            <p className="text-sm md:text-base text-muted-foreground">
              Features in development:
            </p>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-xs md:text-sm">
              <div className="p-2 md:p-3 bg-muted rounded-lg">🏨 Room Management</div>
              <div className="p-2 md:p-3 bg-muted rounded-lg">📅 Booking Calendar</div>
              <div className="p-2 md:p-3 bg-muted rounded-lg">🧹 Housekeeping</div>
              <div className="p-2 md:p-3 bg-muted rounded-lg">💳 Payment Processing</div>
            </div>
            <div className="pt-3 md:pt-4">
              <Button size="lg" className="w-full sm:w-auto">
                Get Notified When Ready
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default HotelPage;
