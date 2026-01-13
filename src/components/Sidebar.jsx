import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { navigationItems } from '@/routes';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { useAuth } from '@/contexts/AuthContext';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const { user } = useAuth();

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

  // Filter navigation items based on user's clients
  const filterNavigationItems = (items) => {
    if (!user?.clients || user.clients.length === 0) {
      return items; // Show all items if no clients info
    }

    return items.filter(item => {
      // Check if user has access to this item's clients
      const hasAccess = item.clients?.some(client => user.clients.includes(client));
      
      if (!hasAccess) return false;
      
      // If item has subcategories, filter them too
      if (item.subcategories) {
        const filteredSubcategories = item.subcategories.filter(subItem => {
          return subItem.clients?.some(client => user.clients.includes(client));
        });
        
        // Only show parent item if it has accessible subcategories
        return filteredSubcategories.length > 0;
      }
      
      return true;
    }).map(item => {
      // Filter subcategories for items that have them
      if (item.subcategories) {
        return {
          ...item,
          subcategories: item.subcategories.filter(subItem => {
            return subItem.clients?.some(client => user.clients.includes(client));
          })
        };
      }
      return item;
    });
  };

  const filteredNavigationItems = filterNavigationItems(navigationItems);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden h-10 w-10"
        onClick={toggleMobile}
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
          "fixed left-0 top-0 z-40 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "flex items-center h-14 md:h-16 px-3 md:px-4 border-b border-sidebar-border",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <h1 className="text-base md:text-lg font-semibold truncate text-sidebar-foreground">
                {APP_NAME}
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform text-sidebar-foreground",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
            {filteredNavigationItems.map((item) => {
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
                          "w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors",
                          "bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          isCollapsed && "justify-center"
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <Icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="truncate flex-1 text-left">{item.title}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
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
                            "flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors",
                            "bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                            isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                            isCollapsed && "justify-center"
                          )
                        }
                        title={isCollapsed ? item.title : undefined}
                      >
                        <Icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        {!isCollapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </NavLink>
                    )}
                  </div>
                  
                  {/* Subcategories */}
                  {hasSubcategories && isExpanded && !isCollapsed && (
                    <div className="ml-4 md:ml-6 mt-1 space-y-1">
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
                                "flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors",
                                "bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-foreground",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                              )
                            }
                          >
                            <SubIcon className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
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
            <div className="p-3 md:p-4 border-t border-sidebar-border">
              <div className="text-xs text-sidebar-foreground/70">
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
