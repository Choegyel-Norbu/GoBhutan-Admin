import { useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import { validateBusForm, sanitizeInput } from '@/lib/validation';
import Swal from 'sweetalert2';

function AddBusPage() {
  const [formData, setFormData] = useState({
    busName: '',
    busNumber: '',
    busType: '',
    totalSeats: '',
    description: '',
    amenities: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    // Only sanitize inputs that need it (busNumber) and preserve spaces for description/amenities
    let processedValue = value;
    
    if (field === 'busNumber') {
      // For bus number, remove spaces and sanitize
      processedValue = typeof value === 'string' ? value.replace(/\s/g, '') : value;
    } else if (field === 'description' || field === 'amenities') {
      // For description and amenities, preserve spaces but remove potential XSS
      processedValue = typeof value === 'string' ? 
        value.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '') : 
        value;
    } else {
      // For other fields, basic sanitization without trimming spaces
      processedValue = typeof value === 'string' ? 
        value.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '') : 
        value;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time validation for immediate feedback
    validateField(field, processedValue);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'busName':
        if (!value.trim()) {
          newErrors.busName = 'Bus name is required';
        } else if (value.trim().length < 2) {
          newErrors.busName = 'Bus name must be at least 2 characters long';
        } else if (value.trim().length > 50) {
          newErrors.busName = 'Bus name must be less than 50 characters';
        } else {
          delete newErrors.busName;
        }
        break;
        
      case 'busNumber':
        if (!value.trim()) {
          newErrors.busNumber = 'Bus number is required';
        } else if (value.trim().length < 3) {
          newErrors.busNumber = 'Bus number must be at least 3 characters long';
        } else if (value.trim().length > 20) {
          newErrors.busNumber = 'Bus number must be less than 20 characters';
        } else if (!/^[a-zA-Z0-9\-]+$/.test(value.trim())) {
          newErrors.busNumber = 'Bus number can only contain letters, numbers, and hyphens';
        } else {
          delete newErrors.busNumber;
        }
        break;
        
      case 'busType':
        if (!value.trim()) {
          newErrors.busType = 'Bus type is required';
        } else {
          delete newErrors.busType;
        }
        break;
        
      case 'totalSeats':
        if (!value || value === '') {
          newErrors.totalSeats = 'Total seats is required';
        } else if (isNaN(parseInt(value))) {
          newErrors.totalSeats = 'Total seats must be a valid number';
        } else if (parseInt(value) < 1) {
          newErrors.totalSeats = 'Total seats must be at least 1';
        } else if (parseInt(value) > 100) {
          newErrors.totalSeats = 'Total seats cannot exceed 100';
        } else {
          delete newErrors.totalSeats;
        }
        break;
        
      case 'description':
        if (value.trim() && value.trim().length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        } else {
          delete newErrors.description;
        }
        break;
        
      case 'amenities':
        if (value.trim() && value.trim().length > 200) {
          newErrors.amenities = 'Amenities must be less than 200 characters';
        } else if (value.trim()) {
          const amenityList = value.split(',').map(a => a.trim()).filter(a => a.length > 0);
          if (amenityList.length > 10) {
            newErrors.amenities = 'Maximum 10 amenities allowed';
          } else {
            // Check individual amenity length
            const longAmenity = amenityList.find(amenity => amenity.length > 30);
            if (longAmenity) {
              newErrors.amenities = 'Each amenity must be less than 30 characters';
            } else {
              delete newErrors.amenities;
            }
          }
        } else {
          delete newErrors.amenities;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form using comprehensive validation
    const validation = validateBusForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Format the data according to the API schema with proper sanitization
      const payload = {
        busName: sanitizeInput(formData.busName),
        busNumber: sanitizeInput(formData.busNumber),
        busType: formData.busType,
        totalSeats: parseInt(formData.totalSeats),
        description: formData.description ? sanitizeInput(formData.description) : null,
        amenities: formData.amenities ? sanitizeInput(formData.amenities) : null
      };

      console.log('Bus payload:', payload);
      
      // Get stored token and set it on the API client
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      // Make API call to POST /api/busses
      console.log('Making API call to:', API_CONFIG.ENDPOINTS.BUS.BUSES);
      console.log('Request payload:', payload);
      
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.BUS.BUSES, payload);
      
      console.log('API Response:', response);
      
      // Handle response - apiClient returns the JSON directly
      if (response && (response.success === true || response.id)) {
        // Show success SweetAlert notification
        await Swal.fire({
          icon: 'success',
          title: 'Bus Added Successfully!',
          text: response.message || `Bus "${formData.busName}" (${formData.busNumber}) has been added successfully.`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981'
        });
        
        // Clear all form fields and errors
        setFormData({
          busName: '',
          busNumber: '',
          busType: '',
          totalSeats: '',
          description: '',
          amenities: ''
        });
        setErrors({});
      } else {
        // Throw error for unsuccessful responses
        throw new Error(response?.message || 'Failed to create bus');
      }
      
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to add bus. Please try again or contact support.';
      
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
        title: 'Failed to Add Bus',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
    
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormData({
      busName: '',
      busNumber: '',
      busType: '',
      totalSeats: '',
      description: '',
      amenities: ''
    });
    setErrors({});
  };

  return (
    <PageWrapper 
      title="Add New Bus" 
      titleClassName="text-xl"
      description="Add a new bus to the fleet management system."
    >
      <div className="w-full mx-auto space-y-6">
        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Bus Information
            </CardTitle>
            <CardDescription>
              Enter the details for the new bus to be added to the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="busName">Bus Name *</Label>
                  <Input
                    id="busName"
                    value={formData.busName}
                    onChange={(e) => handleInputChange('busName', e.target.value)}
                    placeholder="e.g., Dug Transport"
                    className={errors.busName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                  />
                  {errors.busName && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.busName}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="busNumber">Bus Number *</Label>
                  <Input
                    id="busNumber"
                    value={formData.busNumber}
                    onChange={(e) => handleInputChange('busNumber', e.target.value)}
                    placeholder="e.g., BP-001"
                    className={errors.busNumber ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                  />
                  {errors.busNumber && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.busNumber}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="busType">Bus Type *</Label>
                  <Select
                    value={formData.busType}
                    onChange={(e) => handleInputChange('busType', e.target.value)}
                    className={errors.busType ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                  >
                    <option value="">Select bus type</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Sleeper">Sleeper</option>
                    <option value="AC">AC Bus</option>
                  </Select>
                  {errors.busType && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.busType}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Seats */}
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Total Seats *</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  value={formData.totalSeats}
                  onChange={(e) => handleInputChange('totalSeats', e.target.value)}
                  placeholder="e.g., 50"
                  className={errors.totalSeats ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                />
                {errors.totalSeats && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.totalSeats}</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Input
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => handleInputChange('amenities', e.target.value)}
                  placeholder="e.g., AC, WiFi, Water, Snacks (comma-separated)"
                  className={errors.amenities ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                />
                {errors.amenities && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.amenities}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Enter amenities separated by commas (e.g., AC, WiFi, Water, Snacks)
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional notes about the bus..."
                  rows={3}
                  className={errors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0'}
                />
                {errors.description && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.description}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Adding Bus...' : 'Add Bus'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Reset Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

export default AddBusPage;
