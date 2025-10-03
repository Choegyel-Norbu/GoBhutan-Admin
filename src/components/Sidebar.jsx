import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { navigationItems } from '@/routes';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  
  const toggleExpanded = (itemPath) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemPath)) {
      newExpanded.delete(itemPath);
    } else {
      newExpanded.add(itemPath);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleMobile}
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-card border-r border-border transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "flex items-center h-16 px-4 border-b border-border",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <h1 className="text-lg font-semibold truncate">
                {APP_NAME}
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const hasSubcategories = item.subcategories && item.subcategories.length > 0;
              const isExpanded = expandedItems.has(item.path);
              
              return (
                <div key={item.path}>
                  {/* Main navigation item */}
                  <div className="relative">
                    {hasSubcategories ? (
                      <button
                        onClick={() => {
                          toggleExpanded(item.path);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isCollapsed && "justify-center"
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="truncate flex-1 text-left">{item.title}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </>
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={() => {
                          // Close any expanded subcategories when clicking other menu items
                          setExpandedItems(new Set());
                          // Close sidebar on mobile for main navigation items without subcategories
                          setIsMobileOpen(false);
                        }}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive && "bg-accent text-accent-foreground",
                            isCollapsed && "justify-center"
                          )
                        }
                        title={isCollapsed ? item.title : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </NavLink>
                    )}
                  </div>
                  
                  {/* Subcategories */}
                  {hasSubcategories && isExpanded && !isCollapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subcategories.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => {
                              // Close any expanded subcategories when clicking subcategory items
                              setExpandedItems(new Set());
                              // Close sidebar on mobile when subcategory is clicked
                              setIsMobileOpen(false);
                            }}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isActive && "bg-accent text-accent-foreground"
                              )
                            }
                          >
                            <SubIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{subItem.title}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                © 2024 GoBhutan
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
