import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

function DashboardCard({ title, value, description, trend, icon: Icon }) {
  const isPositiveTrend = trend && trend.startsWith('+');
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-lg md:text-2xl font-bold">{value}</div>
        <div className={`flex items-center ${trend ? 'justify-between' : 'justify-start'} mt-1 md:mt-2`}>
          <CardDescription className="text-xs">
            {description}
          </CardDescription>
          {trend && (
            <Badge 
              variant={isPositiveTrend ? "default" : "destructive"}
              className="flex items-center gap-1 text-xs"
            >
              <TrendIcon className="h-2 w-2 md:h-3 md:w-3" />
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardCard;
