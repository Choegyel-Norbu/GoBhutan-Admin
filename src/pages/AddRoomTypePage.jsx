import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Home } from 'lucide-react';
import { apiClient } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

const AddRoomTypePage = () => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Room type name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Room type name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.name = 'Room type name must be less than 50 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'description':
        if (value.trim() && value.trim().length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        } else {
          delete newErrors.description;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Validate the field
    validateField(name, type === 'checkbox' ? checked : value);
  };

  const validateForm = () => {
    const allErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateFieldSync(key, formData[key]);
      if (fieldErrors) {
        allErrors[key] = fieldErrors;
      }
    });
    
    // Update errors state with all validation errors
    setErrors(allErrors);
    
    // If there are errors, scroll to the first error field
    if (Object.keys(allErrors).length > 0) {
      scrollToFirstError(allErrors);
    }
    
    return Object.keys(allErrors).length === 0;
  };

  const validateFieldSync = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'Room type name is required';
        } else if (value.trim().length < 2) {
          return 'Room type name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          return 'Room type name must be less than 50 characters';
        }
        break;
        
      case 'description':
        if (value.trim() && value.trim().length > 500) {
          return 'Description must be less than 500 characters';
        }
        break;
        
      default:
        break;
    }
    return null;
  };

  // Function to scroll to the first field with validation error
  const scrollToFirstError = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;
    
    const firstErrorKey = errorKeys[0];
    const elementToScroll = document.getElementById(firstErrorKey);
    
    if (elementToScroll) {
      elementToScroll.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Focus the field after scrolling
      setTimeout(() => {
        elementToScroll.focus();
      }, 300);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form - this will also handle scrolling to first error
    if (validateForm()) {
      try {
        // Prepare the payload according to the specified format
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim()
        };

        console.log('Room Type Payload:', payload);
        
        // Get stored token and set it on the API client
        const token = authAPI.getStoredToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        
        // Make API call to POST room type endpoint
        console.log('Making API call to:', API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES);
        
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES, payload);
        
        console.log('API Response:', response);
        
        // Handle response
        if (response) {
          await Swal.fire({
            icon: 'success',
            title: 'Room Type Added Successfully!',
            text: response.message || `${formData.name} has been added to your room types successfully.`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981'
          });
          
          // Clear all form fields
          clearForm();
        } else {
          // Throw error for unsuccessful responses
          throw new Error(response?.message || 'Failed to create room type');
        }
        
      } catch (error) {
        console.error('Error adding room type:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          response: error.response,
          stack: error.stack
        });
        
        let errorMessage = 'Failed to add room type. Please try again or contact support.';
        
        if (error.response) {
          // Server responded with error status
          console.error('Server response:', error.response);
          errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || error.message}`;
        } else if (error.request) {
          // Request was made but no response received
          console.error('No response received:', error.request);
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          // Something else happened
          console.error('Request setup error:', error.message);
          errorMessage = `Request error: ${error.message}`;
        }
        
        // Show error SweetAlert notification
        await Swal.fire({
          icon: 'error',
          title: 'Failed to Add Room Type',
          text: errorMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        // Always reset isSubmitting state, regardless of success or failure
        setIsSubmitting(false);
      }
    } else {
      // Validation failed - reset isSubmitting state immediately
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-0 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Home className="h-6 w-6" />
          Add New Room Type
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new room type configuration for your hotels
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Room Type Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Room Type Details</CardTitle>
            <CardDescription>
              Enter the details for the new room type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Type Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Deluxe Suite, Standard Room"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the room type, its features, and what makes it special..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Room Type...' : 'Add Room Type'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRoomTypePage;
