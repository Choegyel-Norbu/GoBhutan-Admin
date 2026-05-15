import { Calendar, Building2, Bus, Bed, RefreshCw, Clapperboard, Car, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

// Service registry — single source of truth for dashboard service rows
const SERVICE_CONFIGS = [
  {
    id: 'hotel',
    clientKeys: ['hotel'],
    title: 'Hotel Management',
    subtitle: 'Properties, rooms & reservations',
    path: '/dashboard/hotel/book',
    Icon: Building2,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    getMetric: (stats) => ({ value: stats.totalHotels, label: 'properties' }),
  },
  {
    id: 'bus',
    clientKeys: ['bus'],
    title: 'Bus Fleet',
    subtitle: 'Routes, schedules & bookings',
    path: '/dashboard/bus/manage',
    Icon: Bus,
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    badgeBg: 'bg-blue-50 dark:bg-blue-900/20',
    badgeText: 'text-blue-700 dark:text-blue-400',
    getMetric: (stats) => ({ value: stats.totalBuses, label: 'vehicles' }),
  },
  {
    id: 'theater',
    clientKeys: ['theater', 'movie', 'cinema'],
    title: 'Theater',
    subtitle: 'Halls, screenings & tickets',
    path: '/dashboard/theater',
    Icon: Clapperboard,
    iconBg: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
    badgeBg: 'bg-violet-50 dark:bg-violet-900/20',
    badgeText: 'text-violet-700 dark:text-violet-400',
    getMetric: () => null,
  },
  {
    id: 'taxi',
    clientKeys: ['taxi'],
    title: 'Taxi Service',
    subtitle: 'Rides, drivers & dispatching',
    path: '/dashboard/taxi',
    Icon: Car,
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-900/20',
    badgeText: 'text-amber-700 dark:text-amber-400',
    getMetric: () => null,
  },
];

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading, refetch } = useDashboard();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserInitials = () => {
    const name = user?.name || 'Admin';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter services by user's client access
  const userClients = user?.clients || [];
  const userRoles = user?.roles || [];
  const isSuperAdmin = userRoles.some(r => ['admin', 'superuser'].includes(r.toLowerCase()));

  const visibleServices = isSuperAdmin
    ? SERVICE_CONFIGS
    : SERVICE_CONFIGS.filter(svc =>
        userClients.some(c =>
          svc.clientKeys.some(k => c.toLowerCase().includes(k))
        )
      );

  const dashboardStats = [
    {
      title: 'Total Hotels',
      value: String(stats.totalHotels),
      description: 'Registered properties',
      icon: Building2,
      variant: 'emerald',
    },
    {
      title: 'Total Rooms',
      value: String(stats.totalRooms),
      description: 'Across all hotels',
      icon: Bed,
      variant: 'violet',
    },
    {
      title: 'Hotel Bookings',
      value: String(stats.hotelBookings),
      description: 'Active reservations',
      icon: Calendar,
      variant: 'blue',
    },
    {
      title: 'Total Buses',
      value: String(stats.totalBuses),
      description: 'Fleet registered',
      icon: Bus,
      variant: 'sky',
    },
  ];

  return (
    <PageWrapper>

      {/* ── Welcome banner ─────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-border">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/5" />
          <div className="absolute -right-4 bottom-0 h-32 w-32 rounded-full bg-primary/4" />
          <div className="absolute right-40 -top-8 h-24 w-24 rounded-full bg-primary/3" />
        </div>
        <CardContent className="relative z-10 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="flex shrink-0 items-center justify-center rounded-2xl bg-primary font-bold text-base text-primary-foreground shadow-md select-none"
                style={{ height: 52, width: 52 }}
              >
                {getUserInitials()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                  {getGreeting()}
                </p>
                <h2 className="text-xl font-bold text-foreground truncate">
                  {user?.name || 'Admin'}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="shrink-0 gap-1.5 h-8 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats KPIs ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Overview
        </p>
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <DashboardCard
              key={stat.title}
              loading={loading}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              variant={stat.variant}
            />
          ))}
        </div>
      </div>

      {/* ── Services Summary ────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Services
        </p>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">

          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2.5">
              {/* Pulsing active indicator */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Active Services
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>
                {visibleServices.length} operational
              </span>
            </div>
          </div>

          {/* Service rows */}
          {visibleServices.length > 0 ? (
            <div className="divide-y divide-border/60">
              {visibleServices.map((svc) => {
                const metric = svc.getMetric(stats);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => navigate(svc.path)}
                    className="group w-full flex items-center gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-muted/30 cursor-pointer"
                  >
                    {/* Service icon */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${svc.iconBg}`}>
                      <svc.Icon className={`h-5 w-5 ${svc.iconColor}`} />
                    </div>

                    {/* Name + subtitle */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {svc.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {svc.subtitle}
                      </p>
                    </div>

                    {/* Metric count */}
                    {metric && (
                      <div className="hidden sm:flex flex-col items-end shrink-0 min-w-[60px]">
                        <span className="text-lg font-bold tabular-nums text-foreground leading-tight">
                          {loading ? (
                            <span className="inline-block h-5 w-8 rounded bg-muted animate-pulse" />
                          ) : (
                            metric.value
                          )}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {metric.label}
                        </span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className={`hidden sm:flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${svc.badgeBg} ${svc.badgeText}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${svc.dot}`} />
                      Active
                    </div>

                    {/* Navigate arrow */}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-150 group-hover:text-foreground group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                <Zap className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No services enabled</p>
              <p className="text-xs text-muted-foreground/60">
                Contact support to activate services for your account.
              </p>
            </div>
          )}

        </div>
      </div>

    </PageWrapper>
  );
}

export default DashboardPage;
