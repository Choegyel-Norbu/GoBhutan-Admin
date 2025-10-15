import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Home, Edit, Trash2, Plus } from 'lucide-react';
import { apiClient } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

const AddRoomTypePage = () => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch room types on component mount
  useEffect(() => {
    fetchRoomTypes();
  }, []);


  // Fetch all room types
  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      console.log('Fetching room types from:', API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES);
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES);
      
      console.log('Room types API response:', response);
      
      // Handle different response formats like other pages do
      if (response && Array.isArray(response)) {
        console.log('Setting room types (direct array):', response);
        setRoomTypes(response);
      } else if (response && response.success && Array.isArray(response.data)) {
        console.log('Setting room types (success with data array):', response.data);
        setRoomTypes(response.data);
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log('Setting room types (data array):', response.data);
        setRoomTypes(response.data);
      } else {
        console.warn('Unexpected room types response format:', response);
        setRoomTypes([]);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      
      // Set empty array on error to show empty state
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit room type
  const handleEdit = (roomType) => {
    setEditingRoomType(roomType);
    setFormData({
      name: roomType.name,
      description: roomType.description
    });
    setShowForm(true);
    
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.getElementById('room-type-form');
      if (formElement) {
        formElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Handle delete room type
  const handleDelete = async (roomType) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete "${roomType.name}" room type.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const token = authAPI.getStoredToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES}/${roomType.id}`);
        
        if (response) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `"${roomType.name}" has been deleted successfully.`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981'
          });
          
          // Refresh the room types list
          fetchRoomTypes();
        }
      } catch (error) {
        console.error('Error deleting room type:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete room type. Please try again.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingRoomType(null);
    clearForm();
  };

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
    setEditingRoomType(null);
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
        
        // Make API call to POST or PUT room type endpoint
        let response;
        if (editingRoomType) {
          const updateEndpoint = `${API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES}/${editingRoomType.id}/roomType`;
          console.log('Making API call to update:', updateEndpoint);
          response = await apiClient.put(updateEndpoint, payload);
        } else {
          console.log('Making API call to create:', API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES);
          response = await apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES, payload);
        }
        
        console.log('API Response:', response);
        
        // Handle response
        if (response) {
          await Swal.fire({
            icon: 'success',
            title: editingRoomType ? 'Room Type Updated Successfully!' : 'Room Type Added Successfully!',
            text: response.message || `${formData.name} has been ${editingRoomType ? 'updated' : 'added'} successfully.`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981'
          });
          
          // Clear all form fields and reset state
          clearForm();
          setShowForm(false);
          setEditingRoomType(null);
          
          // Refresh the room types list
          fetchRoomTypes();
        } else {
          // Throw error for unsuccessful responses
          throw new Error(response?.message || `Failed to ${editingRoomType ? 'update' : 'create'} room type`);
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
          Room Types Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage room types for your hotels
        </p>
      </div>

      {/* Room Types Table */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-md">Room Types</CardTitle>
              <CardDescription>
                View and manage all room types
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchRoomTypes}
                variant="outline"
                className="flex items-center gap-2"
              >
                Refresh
              </Button>
              <Button 
                onClick={() => {
                  setShowForm(true);
                  clearForm();
                  
                  // Scroll to form after a short delay to ensure it's rendered
                  setTimeout(() => {
                    const formElement = document.getElementById('room-type-form');
                    if (formElement) {
                      formElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }, 100);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Room Type
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Debug info */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            Debug: loading={loading.toString()}, roomTypes.length={roomTypes.length}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Loading room types...</div>
            </div>
          ) : roomTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No room types found. Click "Add New Room Type" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">ID</th>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map((roomType) => (
                    <tr key={roomType.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{roomType.id}</td>
                      <td className="p-3 font-medium">{roomType.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {roomType.description || 'No description'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(roomType)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(roomType)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showForm && (
        <Card id="room-type-form">
          <CardHeader>
            <CardTitle className="text-md">
              {editingRoomType ? 'Edit Room Type' : 'Add New Room Type'}
            </CardTitle>
            <CardDescription>
              {editingRoomType ? 'Update the room type details' : 'Enter the details for the new room type'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
                  {isSubmitting 
                    ? (editingRoomType ? 'Updating...' : 'Adding...') 
                    : (editingRoomType ? 'Update Room Type' : 'Add Room Type')
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddRoomTypePage;
