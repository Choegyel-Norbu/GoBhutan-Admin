import { Card, CardContent } from './ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  blue:    { bg: 'bg-blue-600',    text: 'text-white', muted: 'text-blue-100',    icon: 'bg-blue-500/40 text-white' },
  emerald: { bg: 'bg-emerald-600', text: 'text-white', muted: 'text-emerald-100', icon: 'bg-emerald-500/40 text-white' },
  violet:  { bg: 'bg-violet-600',  text: 'text-white', muted: 'text-violet-100',  icon: 'bg-violet-500/40 text-white' },
  sky:     { bg: 'bg-sky-600',     text: 'text-white', muted: 'text-sky-100',     icon: 'bg-sky-500/40 text-white' },
  default: { bg: 'bg-card',        text: 'text-foreground', muted: 'text-muted-foreground', icon: 'bg-secondary/10 text-secondary' },
};

function DashboardCard({ title, value, description, trend, icon: Icon, variant = 'default', loading }) {
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const isColored = variant !== 'default';
  const isPositiveTrend = trend && trend.startsWith('+');

  return (
    <Card className={cn('relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5', v.bg)}>
      {/* Decorative background circles (only for colored variants) */}
      {isColored && (
        <svg
          className="pointer-events-none absolute right-0 top-0 h-full w-2/3 opacity-100"
          viewBox="0 0 300 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="220" cy="100" r="90" fill="white" fillOpacity="0.07" />
          <circle cx="265" cy="55"  r="60" fill="white" fillOpacity="0.09" />
          <circle cx="200" cy="165" r="50" fill="white" fillOpacity="0.06" />
          <circle cx="275" cy="155" r="30" fill="white" fillOpacity="0.11" />
        </svg>
      )}

      <CardContent className="relative z-10 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className={cn('text-xs font-medium uppercase tracking-wider truncate', v.muted)}>
              {title}
            </p>
            {loading ? (
              <div className={cn('h-8 w-20 rounded-md animate-pulse', isColored ? 'bg-white/20' : 'bg-muted')} />
            ) : (
              <p className={cn('text-2xl md:text-3xl font-bold tracking-tight tabular-nums', v.text)}>
                {value}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {description && (
                <span className={cn('text-xs', v.muted)}>{description}</span>
              )}
              {trend && !loading && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  isPositiveTrend ? 'text-green-300' : 'text-red-300'
                )}>
                  {isPositiveTrend
                    ? <ArrowUpRight className="h-3 w-3" />
                    : <ArrowDownRight className="h-3 w-3" />
                  }
                  {trend}
                </span>
              )}
            </div>
          </div>
          {Icon && (
            <div className={cn('flex-shrink-0 rounded-xl p-2.5', v.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardCard;
