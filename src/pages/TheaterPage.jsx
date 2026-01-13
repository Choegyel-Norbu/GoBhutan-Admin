import { Clapperboard, Film, Grid3x3, Building } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DashboardCard from '@/components/DashboardCard';

function TheaterPage() {
  return (
    <PageWrapper 
      title="Theater Management" 
      description="Manage theater operations, seat configurations, and movie screenings."
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Theaters"
          value="5"
          description="Registered"
          trend="+1"
          icon={Building}
        />
        <DashboardCard
          title="Active Movies"
          value="12"
          description="Currently showing"
          trend="+3"
          icon={Film}
        />
        <DashboardCard
          title="Total Seats"
          value="2,500"
          description="Across all theaters"
          trend="+200"
          icon={Grid3x3}
        />
        <DashboardCard
          title="Today's Shows"
          value="24"
          description="Scheduled screenings"
          trend="+5"
          icon={Clapperboard}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common theater management tasks and operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Building className="h-5 w-5" />
              <span className="text-lg">Register Theater</span>
              <span className="text-sm text-muted-foreground">Add new theater to system</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Grid3x3 className="h-5 w-5" />
              <span className="text-lg">Seat Configuration</span>
              <span className="text-sm text-muted-foreground">Configure seat layouts</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Film className="h-5 w-5" />
              <span className="text-lg">Movie Management</span>
              <span className="text-sm text-muted-foreground">Register and manage movies</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest theater operations and movie screenings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">New theater registered</p>
                <p className="text-sm text-muted-foreground">Theater added to system</p>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Movie scheduled</p>
                <p className="text-sm text-muted-foreground">New screening added</p>
              </div>
              <span className="text-sm text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Seat configuration updated</p>
                <p className="text-sm text-muted-foreground">Theater layout modified</p>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default TheaterPage;

