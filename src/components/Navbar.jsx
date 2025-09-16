import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Bell, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '@/lib/utils';

function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex justify-end h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
     {/* Right side */}
      <div className="flex items-center justify-end gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            3
          </Badge>
          <span className="sr-only">Notifications (3 unread)</span>
        </Button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-10"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              C
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium">Chogyal</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </Button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <div className="font-medium">Chogyal</div>
                <div className="text-sm text-muted-foreground">chogyal@gmail.com</div>
              </div>
              
              <div className="p-1">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent rounded-md transition-colors">
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent rounded-md transition-colors">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <div className="border-t border-border my-1" />
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
