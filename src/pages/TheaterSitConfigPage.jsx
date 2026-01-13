import { Grid3x3 } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

function TheaterSitConfigPage() {
  return (
    <PageWrapper 
      title="Theater Seat Configuration" 
      description="Configure theater seat layouts and arrangements."
    >
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Grid3x3 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Seat Configuration</CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Theater seat configuration feature coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground">
            This section will allow you to configure seat layouts, arrangements, and pricing for theaters.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default TheaterSitConfigPage;

