import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { UserCog, Save, Loader2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';
import PageWrapper from '@/components/PageWrapper';
import { api } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import { extractUserInfoFromToken } from '@/lib/tokenUtils';

const UserSettingsPage = () => {
  const { user, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    clients: []
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      // Try to get additional user info from token
      let tokenEmail = '';
      let tokenLastName = '';
      let tokenFirstName = '';
      
      try {
        const authData = authAPI.getStoredAuthData();
        if (authData?.accessToken) {
          const tokenInfo = extractUserInfoFromToken(authData.accessToken);
          if (tokenInfo) {
            tokenEmail = tokenInfo.email || '';
            tokenFirstName = tokenInfo.given_name || '';
            tokenLastName = tokenInfo.family_name || '';
          }
        }
      } catch (error) {
        console.warn('Could not extract token info:', error);
      }
      
      // Extract firstName and lastName from user.name if token doesn't have them
      const nameParts = user.name?.split(' ') || [];
      const extractedFirstName = tokenFirstName || nameParts[0] || '';
      const extractedLastName = tokenLastName || nameParts.slice(1).join(' ') || '';
      
      setFormData({
        username: user.username || '',
        email: user.email || tokenEmail || '',
        password: '',
        confirmPassword: '',
        firstName: extractedFirstName,
        lastName: extractedLastName,
        clients: user.clients || []
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientChange = (client) => {
    setFormData(prev => {
      const clients = prev.clients || [];
      const newClients = clients.includes(client)
        ? clients.filter(c => c !== client)
        : [...clients, client];
      return {
        ...prev,
        clients: newClients
      };
    });
  };

  const validateForm = () => {
    // Validate username is provided
    if (!formData.username || formData.username.trim() === '') {
      setError('Username is required.');
      return false;
    }

    // Validate that clients is an array
    if (!Array.isArray(formData.clients)) {
      setError('Clients data is invalid.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Show loading alert
      Swal.fire({
        title: 'Updating Profile...',
        text: 'Please wait while we update your profile.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare update data - send clients and username
      const updateData = {
        clients: formData.clients,
        username: formData.username
      };

      // Call API to update clients and username
      const response = await api.auth.updateClients(updateData);

      // Update local storage with new clients data
      try {
        // Update auth data (gobhutan_auth_data) - where clients are stored
        const authData = authAPI.getStoredAuthData();
        if (authData) {
          const updatedAuthData = {
            ...authData,
            clients: formData.clients,
            username: formData.username,
            timestamp: Date.now()
          };
          // Store updated auth data using secure storage pattern
          localStorage.setItem('gobhutan_auth_data', JSON.stringify(updatedAuthData));
        }

        // Update user data (gobhutan_user_data) - where user profile is stored
        const userData = authAPI.getStoredUser();
        if (userData) {
          const updatedUserData = {
            ...userData,
            clients: formData.clients,
            username: formData.username
          };
          // Store updated user data using secure storage pattern
          localStorage.setItem('gobhutan_user_data', JSON.stringify(updatedUserData));
        }
      } catch (error) {
        console.error('Error updating local storage:', error);
      }

      // Refresh auth context to update user state without page reload
      refreshAuth();

      // Update form data to reflect the new clients
      setFormData(prev => ({
        ...prev,
        clients: formData.clients,
        password: '',
        confirmPassword: ''
      }));

      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableClients = ['hotel', 'bus', 'taxi', 'flight', 'movie'];

  return (
    <PageWrapper
      title="User Settings"
      description="Manage your profile information and preferences."
    >
      <div className="w-full">

        {/* Profile Form */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  {error}
                </div>
              )}

              {/* Username and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Change Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Leave blank if you don't want to change your password.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              {/* Clients Section */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Clients</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select which client services you have access to.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {availableClients.map((client) => (
                    <div key={client} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`client-${client}`}
                        checked={formData.clients.includes(client)}
                        onChange={() => handleClientChange(client)}
                        className="rounded border-gray-300"
                      />
                      <Label 
                        htmlFor={`client-${client}`}
                        className="text-sm capitalize cursor-pointer"
                      >
                        {client}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default UserSettingsPage;

