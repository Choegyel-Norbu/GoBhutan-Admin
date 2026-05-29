import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

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
    setIsProfileOpen(false);

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Sign out?',
      text: 'You will need to sign in again to access the admin panel.',
      showCancelButton: true,
      confirmButtonText: 'Sign out',
      cancelButtonText: 'Stay signed in',
      confirmButtonColor: '#ef4444',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
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
    <header className="sticky top-0 z-30 flex justify-end h-14 md:h-16 items-center gap-2 md:gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
     {/* Right side */}
      <div className="flex items-center justify-end gap-2">

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-9 md:h-10 px-2 md:px-3 text-foreground hover:bg-transparent hover:text-foreground focus-visible:bg-transparent focus-visible:text-foreground"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs md:text-sm">
              {getUserInitials(user?.name || user?.username)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs md:text-sm font-medium">{user?.name || user?.username || 'User'}</div>
              <div className="text-xs text-muted-foreground">
                {user?.clients?.includes('admin') ? 'Admin' : 'User'}
              </div>
            </div>
          </Button>

          {isProfileOpen && (
            <div className="fixed left-3 right-3 top-16 w-auto bg-popover border border-border rounded-lg shadow-lg z-50 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-48">
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4 shrink-0" aria-hidden />
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
