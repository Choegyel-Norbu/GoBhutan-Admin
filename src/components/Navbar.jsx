import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Redirect to sign in page
      navigate('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out fails, redirect to sign in
      navigate('/signin');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex justify-end h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
     {/* Right side */}
      <div className="flex items-center justify-end gap-2">

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
              {getUserInitials(user?.name || user?.username)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium">{user?.name || user?.username || 'User'}</div>
              <div className="text-xs text-muted-foreground">
                {user?.clients?.includes('admin') ? 'Admin' : 'User'}
              </div>
            </div>
          </Button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
              <div className="p-1">
                <button 
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
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
