import { cn } from '@/lib/utils';

function PageWrapper({ children, className, title, description, titleClassName, icon: Icon, actions }) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
          {/* Top accent gradient bar */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {Icon && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h1 className={cn("text-2xl font-bold tracking-tight text-foreground", titleClassName)}>
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

export default PageWrapper;
