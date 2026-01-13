import { cn } from '@/lib/utils';

function PageWrapper({ children, className, title, description, titleClassName }) {
  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-1 md:space-y-2">
          {title && (
            <h1 className={cn("text-xl md:text-3xl font-bold tracking-tight", titleClassName)}>{title}</h1>
          )}
          {description && (
            <p className="text-sm md:text-base text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4 md:space-y-6">
        {children}
      </div>
    </div>
  );
}

export default PageWrapper;
