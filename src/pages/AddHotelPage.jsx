import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Building, MapPin, Phone, Mail, Wifi, Car, Dumbbell, Coffee, Shield, Utensils, Upload, Image as ImageIcon, Trash2, Globe } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { apiClient } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import { useWallet } from '@/contexts/WalletContext';
import Swal from 'sweetalert2';

const AddHotel = ({ hotelId = null }) => {
  const navigate = useNavigate();
  const { walletBalance, isWalletLoading, refreshWalletBalance } = useWallet();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasWalletLoaded, setHasWalletLoaded] = useState(false);

  useEffect(() => {
    const loadWalletBalance = async () => {
      await refreshWalletBalance();
      setHasWalletLoaded(true);
    };

    loadWalletBalance();
  }, [refreshWalletBalance]);

  // Check wallet balance on component mount
  useEffect(() => {
    if (isWalletLoading || !hasWalletLoaded) {
      return;
    }

    if (walletBalance < 1000) {
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BT', {
          style: 'currency',
          currency: 'BTN',
          minimumFractionDigits: 2
        }).format(amount);
      };

      Swal.fire({
        icon: 'warning',
        title: 'Insufficient Funds',
        html: `
          <div style="text-align: center;">
            <p style="margin-bottom: 16px; font-size: 16px;">
              Your wallet balance is <strong>${formatCurrency(walletBalance)}</strong>, which is below the minimum required amount of <strong>${formatCurrency(1000)}</strong>.
            </p>
            <p style="margin-bottom: 20px; color: #6b7280;">
              Please refill your wallet to register a new hotel.
            </p>
          </div>
        `,
        showCancelButton: false,
        confirmButtonText: 'Go to Wallet',
        confirmButtonColor: '#10b981',
        reverseButtons: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/dashboard/wallet');
        }
      });
    }
  }, [walletBalance, isWalletLoading, hasWalletLoaded, navigate]);

  // Function to clear all form fields
  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      starRating: 0,
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      phoneNumber: '',
      email: '',
      website: '',
      checkInTime: '',
      checkOutTime: '',
      images: [],
      amenities: hotelAmenityOptions
    });
    setErrors({});
  };
  

  // Define hotel amenity options first
  const hotelAmenityOptions = [
    { 
      id: 1, 
      key: 'wifi', 
      name: 'Free WiFi', 
      description: 'High-speed internet throughout the hotel',
      iconClass: 'fa-wifi',
      category: 'CONNECTIVITY',
      icon: Wifi,
      selected: false
    },
    { 
      id: 2, 
      key: 'parking', 
      name: 'Free Parking', 
      description: 'Complimentary parking for guests',
      iconClass: 'fa-car',
      category: 'BASIC',
      icon: Car,
      selected: false
    },
    { 
      id: 3, 
      key: 'pool', 
      name: 'Swimming Pool', 
      description: 'Olympic-sized outdoor pool',
      iconClass: 'fa-swimming-pool',
      category: 'RECREATION',
      icon: Building,
      selected: false
    },
    { 
      id: 4, 
      key: 'gym', 
      name: 'Fitness Center', 
      description: 'Well-equipped fitness center',
      iconClass: 'fa-dumbbell',
      category: 'RECREATION',
      icon: Dumbbell,
      selected: false
    },
    { 
      id: 5, 
      key: 'spa', 
      name: 'Spa & Wellness', 
      description: 'Full-service spa with massage therapies',
      iconClass: 'fa-spa',
      category: 'WELLNESS',
      icon: Building,
      selected: false
    },
    { 
      id: 6, 
      key: 'restaurant', 
      name: 'Restaurant', 
      description: 'On-site dining restaurant',
      iconClass: 'utensils',
      category: 'DINING',
      icon: Utensils,
      selected: false
    },
    { 
      id: 7, 
      key: 'bar', 
      name: 'Bar/Lounge', 
      description: 'Bar and lounge area',
      iconClass: 'coffee',
      category: 'DINING',
      icon: Coffee,
      selected: false
    },
    { 
      id: 8, 
      key: 'businessCenter', 
      name: 'Business Center', 
      description: 'Business center with meeting facilities',
      iconClass: 'building',
      category: 'BUSINESS',
      icon: Building,
      selected: false
    },
    { 
      id: 9, 
      key: 'conferenceRoom', 
      name: 'Conference Rooms', 
      description: 'Conference and meeting rooms',
      iconClass: 'building',
      category: 'BUSINESS',
      icon: Building,
      selected: false
    },
    { 
      id: 10, 
      key: 'airportShuttle', 
      name: 'Airport Shuttle', 
      description: 'Complimentary airport shuttle service',
      iconClass: 'car',
      category: 'BASIC',
      icon: Car,
      selected: false
    },
    { 
      id: 11, 
      key: 'roomService', 
      name: 'Room Service', 
      description: '24/7 room service available',
      iconClass: 'utensils',
      category: 'BASIC',
      icon: Utensils,
      selected: false
    },
    { 
      id: 12, 
      key: 'laundry', 
      name: 'Laundry Service', 
      description: 'Laundry and dry cleaning services',
      iconClass: 'building',
      category: 'BASIC',
      icon: Building,
      selected: false
    },
    { 
      id: 13, 
      key: 'concierge', 
      name: 'Concierge', 
      description: 'Professional concierge services',
      iconClass: 'shield',
      category: 'BASIC',
      icon: Shield,
      selected: false
    },
    { 
      id: 14, 
      key: 'petFriendly', 
      name: 'Pet Friendly', 
      description: 'Pet-friendly accommodations',
      iconClass: 'building',
      category: 'BASIC',
      icon: Building,
      selected: false
    },
    { 
      id: 15, 
      key: 'smokingAllowed', 
      name: 'Smoking Allowed', 
      description: 'Designated smoking areas',
      iconClass: 'building',
      category: 'BASIC',
      icon: Building,
      selected: false
    }
  ];

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    starRating: 0,
    
    // Location Information
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    
    // Contact Information
    phoneNumber: '',
    email: '',
    website: '',
    
    // Hotel Details
    checkInTime: '',
    checkOutTime: '',
    
    // Hotel Images
    images: [],
    
    // Amenities
    amenities: hotelAmenityOptions
  });

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Hotel name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Hotel name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          newErrors.name = 'Hotel name must be less than 100 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'description':
        if (value.trim() && value.trim().length > 1000) {
          newErrors.description = 'Description must be less than 1000 characters';
        } else {
          delete newErrors.description;
        }
        break;

      case 'starRating':
        if (value && (isNaN(value) || value < 0 || value > 9)) {
          newErrors.starRating = 'Please select a valid category option';
        } else {
          delete newErrors.starRating;
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else if (value.trim().length < 5) {
          newErrors.address = 'Address must be at least 5 characters';
        } else if (value.trim().length > 200) {
          newErrors.address = 'Address must be less than 200 characters';
        } else {
          delete newErrors.address;
        }
        break;
        
      case 'city':
        if (!value.trim()) {
          newErrors.city = 'City is required';
        } else if (value.trim().length < 2) {
          newErrors.city = 'City name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.city = 'City name must be less than 50 characters';
        } else {
          delete newErrors.city;
        }
        break;
        
      case 'state':
        if (value.trim() && value.trim().length > 50) {
          newErrors.state = 'State name must be less than 50 characters';
        } else {
          delete newErrors.state;
        }
        break;
        
      case 'country':
        if (!value.trim()) {
          newErrors.country = 'Country is required';
        } else if (value.trim().length < 2) {
          newErrors.country = 'Country name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.country = 'Country name must be less than 50 characters';
        } else {
          delete newErrors.country;
        }
        break;
        
      case 'postalCode':
        if (value.trim() && value.trim().length > 20) {
          newErrors.postalCode = 'Postal code must be less than 20 characters';
        } else {
          delete newErrors.postalCode;
        }
        break;
        
      case 'phoneNumber':
        if (!value.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\+975\s?\d{1,2}\s?\d{6}$/.test(value.trim())) {
          newErrors.phoneNumber = 'Please enter a valid Bhutanese phone number (e.g., +975 2 123456)';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else if (value.length > 100) {
          newErrors.email = 'Email address must be less than 100 characters';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'website':
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          newErrors.website = 'Website must start with http:// or https://';
        } else if (value.trim() && value.length > 200) {
          newErrors.website = 'Website URL must be less than 200 characters';
        } else {
          delete newErrors.website;
        }
        break;
        
      case 'checkInTime':
        if (value.trim() && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          newErrors.checkInTime = 'Please enter a valid time format (HH:MM)';
        } else {
          delete newErrors.checkInTime;
        }
        break;
        
      case 'checkOutTime':
        if (value.trim() && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          newErrors.checkOutTime = 'Please enter a valid time format (HH:MM)';
        } else {
          delete newErrors.checkOutTime;
        }
        break;
        

      // Room validation
      case 'roomNumber':
        if (!value.trim()) {
          newErrors[name] = 'Room number is required';
        } else if (value.trim().length > 20) {
          newErrors[name] = 'Room number must be less than 20 characters';
        } else {
          delete newErrors[name];
        }
        break;

      case 'basePrice':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          newErrors[name] = 'Base price must be a positive number';
        } else {
          delete newErrors[name];
        }
        break;

      case 'maxOccupancy':
        if (!value || isNaN(value) || parseInt(value) <= 0) {
          newErrors[name] = 'Max occupancy must be a positive number';
        } else {
          delete newErrors[name];
        }
        break;

      case 'roomType':
        if (!value || value === '') {
          newErrors[name] = 'Room type is required';
        } else {
          delete newErrors[name];
        }
        break;

      case 'roomTypeName':
        if (!value.trim()) {
          newErrors[name] = 'Room type name is required';
        } else if (value.trim().length > 50) {
          newErrors[name] = 'Room type name must be less than 50 characters';
        } else {
          delete newErrors[name];
        }
        break;

      case 'bedCount':
        if (!value || isNaN(value) || parseInt(value) <= 0) {
          newErrors[name] = 'Bed count must be a positive number';
        } else {
          delete newErrors[name];
        }
        break;

      case 'bedType':
        if (!value.trim()) {
          newErrors[name] = 'Bed type is required';
        } else {
          delete newErrors[name];
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('amenities.')) {
      const amenityKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.map(amenity => 
          amenity.key === amenityKey 
            ? { ...amenity, selected: checked }
            : amenity
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Validate the field
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const validateForm = () => {
    const allErrors = {};
    
    // Validate all basic fields
    Object.keys(formData).forEach(key => {
      if (key !== 'amenities') {
        const fieldErrors = validateFieldSync(key, formData[key]);
        if (fieldErrors) {
          allErrors[key] = fieldErrors;
        }
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

  // Function to scroll to the first field with validation error
  const scrollToFirstError = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;
    
    // Sort error keys to prioritize field order
    const fieldOrder = ['name', 'description', 'starRating', 'address', 'city', 'state', 'country', 'postalCode', 'phoneNumber', 'email', 'website', 'checkInTime', 'checkOutTime'];
    const sortedErrorKeys = errorKeys.sort((a, b) => {
      const indexA = fieldOrder.indexOf(a);
      const indexB = fieldOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
    
    const firstErrorKey = sortedErrorKeys[0];
    const elementToScroll = document.getElementById(firstErrorKey);
    
    if (elementToScroll) {
      elementToScroll.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Focus the field after scrolling
      setTimeout(() => {
        const inputElement = elementToScroll.querySelector('input, select, textarea');
        if (inputElement) {
          inputElement.focus();
        }
      }, 300);
    }
  };

  const validateFieldSync = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'Hotel name is required';
        } else if (value.trim().length < 2) {
          return 'Hotel name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          return 'Hotel name must be less than 100 characters';
        }
        break;
        
      case 'description':
        if (value.trim() && value.trim().length > 1000) {
          return 'Description must be less than 1000 characters';
        }
        break;

      case 'starRating':
        if (value && (isNaN(value) || value < 0 || value > 9)) {
          return 'Please select a valid category option';
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          return 'Address is required';
        } else if (value.trim().length < 5) {
          return 'Address must be at least 5 characters';
        } else if (value.trim().length > 200) {
          return 'Address must be less than 200 characters';
        }
        break;
        
      case 'city':
        if (!value.trim()) {
          return 'City is required';
        } else if (value.trim().length < 2) {
          return 'City name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          return 'City name must be less than 50 characters';
        }
        break;
        
      case 'state':
        if (value.trim() && value.trim().length > 50) {
          return 'State name must be less than 50 characters';
        }
        break;
        
      case 'country':
        if (!value.trim()) {
          return 'Country is required';
        } else if (value.trim().length < 2) {
          return 'Country name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          return 'Country name must be less than 50 characters';
        }
        break;
        
      case 'postalCode':
        if (value.trim() && value.trim().length > 20) {
          return 'Postal code must be less than 20 characters';
        }
        break;
        
      case 'phoneNumber':
        if (!value.trim()) {
          return 'Phone number is required';
        } else if (!/^\+975\s?\d{1,2}\s?\d{6}$/.test(value.trim())) {
          return 'Please enter a valid Bhutanese phone number (e.g., +975 2 123456)';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          return 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        } else if (value.length > 100) {
          return 'Email address must be less than 100 characters';
        }
        break;
        
      case 'website':
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          return 'Website must start with http:// or https://';
        } else if (value.trim() && value.length > 200) {
          return 'Website URL must be less than 200 characters';
        }
        break;
        
      case 'checkInTime':
        if (value.trim() && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          return 'Please enter a valid time format (HH:MM)';
        }
        break;
        
      case 'checkOutTime':
        if (value.trim() && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          return 'Please enter a valid time format (HH:MM)';
        }
        break;
        
        
      default:
        break;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form - this will also handle scrolling to first error
    if (validateForm()) {
      try {
        // Create FormData for file uploads and form-data submission
        const formDataToSend = new FormData();
        
        // Add basic hotel information as flat form-data fields
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('address', formData.address);
        formDataToSend.append('city', formData.city);
        formDataToSend.append('state', formData.state || '');
        formDataToSend.append('country', formData.country);
        formDataToSend.append('postalCode', formData.postalCode || '');
        formDataToSend.append('phoneNumber', formData.phoneNumber);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('website', formData.website || '');
        formDataToSend.append('starRating', (parseInt(formData.starRating) || 0).toString());
        
        // Add amenities as indexed array entries
        // Format: amenities[0].name, amenities[0].description, amenities[0].iconClass, amenities[0].category
        const selectedAmenities = formData.amenities.filter(amenity => amenity.selected);
        selectedAmenities.forEach((amenity, index) => {
          formDataToSend.append(`amenities[${index}].name`, amenity.name);
          formDataToSend.append(`amenities[${index}].description`, amenity.description);
          // Map iconClass to the format expected by backend (fa-wifi, fa-swimming-pool, etc.)
          const iconClass = amenity.iconClass.startsWith('fa-') 
            ? amenity.iconClass 
            : `fa-${amenity.iconClass}`;
          formDataToSend.append(`amenities[${index}].iconClass`, iconClass);
          formDataToSend.append(`amenities[${index}].category`, amenity.category);
        });
        
        // Add hotel images as files with key "hotelImages"
        formData.images.forEach((image) => {
          formDataToSend.append('hotelImages', image.file);
        });

        console.log('Hotel FormData:', formDataToSend);
        // Log form data entries for debugging
        for (const [key, value] of formDataToSend.entries()) {
          console.log(`${key}:`, value instanceof File ? value.name : value);
        }
        
        // Get stored token and set it on the API client
        const token = authAPI.getStoredToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        
        // Make API call to POST /api/v1/hotels with FormData
        console.log('Making API call to:', API_CONFIG.ENDPOINTS.HOTEL.HOTELS);
        
        const response = await apiClient.postFormData(API_CONFIG.ENDPOINTS.HOTEL.HOTELS, formDataToSend);
        
        console.log('API Response:', response);
        
        // Handle response - apiClient returns the JSON directly
        // Your API returns: { success: true, message: "...", data: {...} }
        if (response && response.success === true) {
          // Show success SweetAlert notification
          await Swal.fire({
            icon: 'success',
            title: 'Hotel Added Successfully!',
            text: response.message || `${formData.name} has been added to your hotel listings successfully.`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981'
          });
          
          // Clear all form fields
          clearForm();
        } else {
          // Throw error for unsuccessful responses
          throw new Error(response?.message || 'Failed to create hotel');
        }
        
      } catch (error) {
        console.error('Error adding hotel:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          response: error.response,
          stack: error.stack
        });
        
        let errorMessage = 'Failed to add hotel. Please try again or contact support.';
        
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
          title: 'Failed to Add Hotel',
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
      // scrollToFirstError was already called in validateForm()
      // Validation errors are already displayed inline with the form fields
    }
  };

  return (
    <PageWrapper
      title="Add New Hotel"
      description="Complete the form below to add a new hotel to the system"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Basic Information</CardTitle>
                <CardDescription>Fundamental details about the hotel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hotel Name <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="starRating" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </Label>
                <Select
                  id="starRating"
                  name="starRating"
                  value={formData.starRating}
                  onChange={handleInputChange}
                  className={errors.starRating ? 'border-destructive' : ''}
                >
                  <option value={0}>Select category</option>
                  <option value={1}>Farm House</option>
                  <option value={2}>Homestay</option>
                  <option value={3}>Budget</option>
                  <option value={4}>Local Hotel</option>
                  <option value={7}>3 Star</option>
                  <option value={8}>4 Star</option>
                  <option value={9}>5 Star</option>
                </Select>
                {errors.starRating && <p className="text-xs text-destructive">{errors.starRating}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the hotel, its unique Bhutanese features, traditional architecture, and what makes it special…"
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Location</CardTitle>
                <CardDescription>Hotel address and location details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Address <span className="text-destructive normal-case tracking-normal font-normal">*</span>
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  City <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City name"
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  State / Province
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State or province"
                  className={errors.state ? 'border-destructive' : ''}
                />
                {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Country <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country name"
                  className={errors.country ? 'border-destructive' : ''}
                />
                {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postalCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal / ZIP code"
                  className={errors.postalCode ? 'border-destructive' : ''}
                />
                {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
                <CardDescription>How guests can reach the hotel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone Number <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+975 2 123456"
                  className={errors.phoneNumber ? 'border-destructive' : ''}
                />
                {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="hotel@bhutan.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Website
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.hotelbhutan.com"
                  className={`pl-9 ${errors.website ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Hotel Images */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Hotel Images</CardTitle>
                <CardDescription>Upload photos to showcase the hotel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/40 hover:bg-muted/20 transition-colors cursor-pointer"
              onClick={() => document.getElementById('images').click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground/60 mb-4">PNG, JPG, WebP</p>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); document.getElementById('images').click(); }}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Choose Images
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Selected ({formData.images.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {formData.images.map((image) => (
                    <div key={image.id} className="relative group aspect-square">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover rounded-lg border border-border/60"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        aria-label="Remove image"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Wifi className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Amenities & Services</CardTitle>
                <CardDescription>Select all that apply to this hotel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {formData.amenities.map((amenity) => {
                const IconComponent = amenity.icon;
                return (
                  <label
                    key={amenity.key}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors select-none ${
                      amenity.selected
                        ? 'border-primary/50 bg-primary/[0.06] text-foreground'
                        : 'border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={`amenities.${amenity.key}`}
                      checked={amenity.selected}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <IconComponent className={`h-3.5 w-3.5 shrink-0 ${amenity.selected ? 'text-primary' : ''}`} />
                    <span className="text-xs font-medium">{amenity.name}</span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Hotel…' : 'Add Hotel'}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default AddHotel;
