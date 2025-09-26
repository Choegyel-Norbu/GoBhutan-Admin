import { useState, useEffect } from 'react';
import { Badge } from './ui/Badge';
import authAPI from '../lib/authAPI';

const UserRolesDisplay = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get stored roles from localStorage
    const roles = authAPI.getStoredUserRoles();
    setUserRoles(roles);
    setIsLoading(false);
  }, []);

  const getRoleVariant = (role) => {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('admin') || roleLower.includes('administrator')) {
      return 'destructive';
    } else if (roleLower.includes('manager') || roleLower.includes('moderator')) {
      return 'default';
    } else if (roleLower.includes('user') || roleLower.includes('member')) {
      return 'secondary';
    } else {
      return 'outline';
    }
  };

  const formatRoleName = (role) => {
    return role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!userRoles || userRoles.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">No Roles</Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {userRoles.map((role, index) => (
        <Badge 
          key={index} 
          variant={getRoleVariant(role)}
          className="text-xs"
        >
          {formatRoleName(role)}
        </Badge>
      ))}
    </div>
  );
};

export default UserRolesDisplay;
