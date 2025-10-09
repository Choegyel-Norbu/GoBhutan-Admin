import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DashboardCard from '@/components/DashboardCard';

function BusPage() {
  return (
    <PageWrapper 
      title="Bus Management" 
      description="Manage bus fleet operations and bookings."
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Buses"
          value="12"
          description="In fleet"
          trend="+2"
        />
        <DashboardCard
          title="Active Routes"
          value="8"
          description="Operating today"
          trend="+1"
        />
        <DashboardCard
          title="Bookings Today"
          value="89"
          description="Tickets sold"
          trend="+22%"
        />
        <DashboardCard
          title="Fleet Status"
          value="80%"
          description="Operational"
          trend="+5%"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common bus management tasks and operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <span className="text-lg">Register Bus</span>
              <span className="text-sm text-muted-foreground">Add new bus to fleet</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <span className="text-lg">Manage Fleet</span>
              <span className="text-sm text-muted-foreground">View and edit buses</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <span className="text-lg">Bookings</span>
              <span className="text-sm text-muted-foreground">Manage reservations</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <span className="text-lg">Settings</span>
              <span className="text-sm text-muted-foreground">Configure system</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest bus operations and bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">New bus registered</p>
                <p className="text-sm text-muted-foreground">BT-005 added to fleet</p>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Booking confirmed</p>
                <p className="text-sm text-muted-foreground">5 seats booked on BT-001</p>
              </div>
              <span className="text-sm text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Maintenance completed</p>
                <p className="text-sm text-muted-foreground">BT-003 service finished</p>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default BusPage;
