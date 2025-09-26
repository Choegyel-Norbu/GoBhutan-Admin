import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Building, MapPin, Phone, Mail, Star, Wifi, Car, Dumbbell, Coffee, Shield, Utensils, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/apiService';

const AddHotel = () => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  
  // Define amenity options first
  const amenityOptions = [
    { 
      id: 1, 
      key: 'wifi', 
      name: 'Free WiFi', 
      description: 'Complimentary high-speed internet access',
      iconClass: 'wifi',
      category: 'BASIC',
      icon: Wifi,
      selected: false
    },
    { 
      id: 2, 
      key: 'parking', 
      name: 'Free Parking', 
      description: 'Complimentary parking for guests',
      iconClass: 'car',
      category: 'BASIC',
      icon: Car,
      selected: false
    },
    { 
      id: 3, 
      key: 'pool', 
      name: 'Swimming Pool', 
      description: 'Outdoor swimming pool facility',
      iconClass: 'building',
      category: 'RECREATION',
      icon: Building,
      selected: false
    },
    { 
      id: 4, 
      key: 'gym', 
      name: 'Fitness Center', 
      description: 'Well-equipped fitness center',
      iconClass: 'dumbbell',
      category: 'RECREATION',
      icon: Dumbbell,
      selected: false
    },
    { 
      id: 5, 
      key: 'spa', 
      name: 'Spa & Wellness', 
      description: 'Relaxing spa and wellness services',
      iconClass: 'building',
      category: 'RECREATION',
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
      category: 'TRANSPORTATION',
      icon: Car,
      selected: false
    },
    { 
      id: 11, 
      key: 'roomService', 
      name: 'Room Service', 
      description: '24/7 room service available',
      iconClass: 'utensils',
      category: 'SERVICE',
      icon: Utensils,
      selected: false
    },
    { 
      id: 12, 
      key: 'laundry', 
      name: 'Laundry Service', 
      description: 'Laundry and dry cleaning services',
      iconClass: 'building',
      category: 'SERVICE',
      icon: Building,
      selected: false
    },
    { 
      id: 13, 
      key: 'concierge', 
      name: 'Concierge', 
      description: 'Professional concierge services',
      iconClass: 'shield',
      category: 'SERVICE',
      icon: Shield,
      selected: false
    },
    { 
      id: 14, 
      key: 'petFriendly', 
      name: 'Pet Friendly', 
      description: 'Pet-friendly accommodations',
      iconClass: 'building',
      category: 'POLICY',
      icon: Building,
      selected: false
    },
    { 
      id: 15, 
      key: 'smokingAllowed', 
      name: 'Smoking Allowed', 
      description: 'Designated smoking areas',
      iconClass: 'building',
      category: 'POLICY',
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
    adminUserId: '',
    isActive: true,
    
    // Amenities
    amenities: amenityOptions,
    
    // Rooms
    rooms: [{
      id: 0,
      roomNumber: '',
      hotel: '',
      roomType: {
        id: 0,
        name: '',
        description: '',
        bedCount: 0,
        bedType: '',
        roomSize: ''
      },
      floor: 0,
      basePrice: 0,
      maxOccupancy: 0,
      status: 'AVAILABLE',
      isActive: true,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]
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
        if (value && (isNaN(value) || value < 0 || value > 5)) {
          newErrors.starRating = 'Star rating must be between 0 and 5';
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
        
      case 'adminUserId':
        if (value.trim() && value.trim().length > 50) {
          newErrors.adminUserId = 'Admin User ID must be less than 50 characters';
        } else {
          delete newErrors.adminUserId;
        }
        break;
        
      case 'isActive':
        if (typeof value !== 'boolean') {
          newErrors.isActive = 'Hotel status must be a valid selection';
        } else {
          delete newErrors.isActive;
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
    } else if (name.startsWith('rooms.')) {
      const parts = name.split('.');
      const roomIndex = parseInt(parts[1]);
      const fieldPath = parts.slice(2);
      
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map((room, index) => {
          if (index === roomIndex) {
            const newRoom = { ...room };
            if (fieldPath.length === 1) {
              // Direct room field
              newRoom[fieldPath[0]] = type === 'checkbox' ? checked : value;
            } else if (fieldPath.length === 2 && fieldPath[0] === 'roomType') {
              // Room type field
              newRoom.roomType = {
                ...newRoom.roomType,
                [fieldPath[1]]: type === 'checkbox' ? checked : value
              };
            }
            return newRoom;
          }
          return room;
        })
      }));
      
      // Validate room fields
      if (fieldPath.length === 1) {
        validateField(fieldPath[0], type === 'checkbox' ? checked : value);
      } else if (fieldPath.length === 2 && fieldPath[0] === 'roomType') {
        validateField(`roomType${fieldPath[1].charAt(0).toUpperCase() + fieldPath[1].slice(1)}`, type === 'checkbox' ? checked : value);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Validate the field
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };

  const addRoom = () => {
    const newRoom = {
      id: 0,
      roomNumber: '',
      hotel: '',
      roomType: {
        id: 0,
        name: '',
        description: '',
        bedCount: 0,
        bedType: '',
        roomSize: ''
      },
      floor: 0,
      basePrice: 0,
      maxOccupancy: 0,
      status: 'AVAILABLE',
      isActive: true,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  };

  const removeRoom = (roomIndex) => {
    if (formData.rooms.length > 1) {
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.filter((_, index) => index !== roomIndex)
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'phoneNumber', 'email', 'address', 'city', 'country'];
    const allErrors = {};
    
    // Validate all fields and collect errors
    Object.keys(formData).forEach(key => {
      if (key !== 'amenities') {
        const fieldErrors = validateFieldSync(key, formData[key]);
        if (fieldErrors) {
          allErrors[key] = fieldErrors;
        }
      }
    });
    
    // Check required fields and add errors if they're empty
    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].toString().trim()) {
        allErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    // Update errors state with all validation errors
    setErrors(allErrors);
    
    return Object.keys(allErrors).length === 0;
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
        if (value && (isNaN(value) || value < 0 || value > 5)) {
          return 'Star rating must be between 0 and 5';
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
        
      case 'adminUserId':
        if (value.trim() && value.trim().length > 50) {
          return 'Admin User ID must be less than 50 characters';
        }
        break;
        
      case 'isActive':
        if (typeof value !== 'boolean') {
          return 'Hotel status must be a valid selection';
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
    setSubmitMessage({ type: '', message: '' });
    
    if (validateForm()) {
      try {
        // Format the data according to the payload structure
        const payload = {
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          website: formData.website,
          starRating: parseInt(formData.starRating) || 0,
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          adminUserId: formData.adminUserId,
          isActive: formData.isActive,
          createdAt: new Date().toISOString(),
          rooms: formData.rooms.map((room, index) => ({
            id: index, // Will be assigned by backend
            roomNumber: room.roomNumber,
            hotel: formData.name, // Hotel reference
            roomType: {
              id: 0, // Will be assigned by backend
              name: room.roomType.name,
              description: room.roomType.description,
              bedCount: parseInt(room.roomType.bedCount) || 0,
              bedType: room.roomType.bedType,
              roomSize: room.roomType.roomSize
            },
            floor: parseInt(room.floor) || 0,
            basePrice: parseFloat(room.basePrice) || 0,
            maxOccupancy: parseInt(room.maxOccupancy) || 0,
            status: room.status,
            isActive: room.isActive,
            description: room.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })),
          amenities: formData.amenities.filter(amenity => amenity.selected).map(amenity => ({
            id: amenity.id,
            name: amenity.name,
            description: amenity.description,
            iconClass: amenity.iconClass,
            category: amenity.category
          }))
        };

        console.log('Hotel payload:', payload);
        
        // Make API call to POST /api/v1/hotels
        const response = await apiClient.post('/api/v1/hotels', payload);
        
        setSubmitMessage({ 
          type: 'success', 
          message: 'Hotel added successfully! You can now view it in the hotel listings.' 
        });
        
        // Reset form after successful submission
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
          adminUserId: '',
          isActive: true,
          amenities: amenityOptions,
          rooms: [{
            id: 0,
            roomNumber: '',
            hotel: '',
            roomType: {
              id: 0,
              name: '',
              description: '',
              bedCount: 0,
              bedType: '',
              roomSize: ''
            },
            floor: 0,
            basePrice: 0,
            maxOccupancy: 0,
            status: 'AVAILABLE',
            isActive: true,
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        });
        setErrors({});
        
      } catch (error) {
        console.error('Error adding hotel:', error);
        setSubmitMessage({ 
          type: 'error', 
          message: 'Failed to add hotel. Please try again or contact support.' 
        });
      }
    } else {
      setSubmitMessage({ 
        type: 'error', 
        message: 'Please fix the errors in the form before submitting.' 
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto p-0 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Add New Hotel
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete the form below to add a new hotel to the system
        </p>
      </div>

      {/* Notification Message */}
      {submitMessage.message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          submitMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {submitMessage.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs">✕</span>
              </div>
            )}
            <span className="font-medium">
              {submitMessage.type === 'success' ? 'Success!' : 'Error!'}
            </span>
          </div>
          <p className="mt-1 text-sm">{submitMessage.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the fundamental details about the hotel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hotel Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="starRating">Star Rating</Label>
                <Select
                  id="starRating"
                  name="starRating"
                  value={formData.starRating}
                  onChange={handleInputChange}
                  className={errors.starRating ? 'border-red-500' : ''}
                >
                  <option value={0}>Select rating</option>
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </Select>
                {errors.starRating && (
                  <p className="text-sm text-red-500">{errors.starRating}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the hotel, its unique Bhutanese features, traditional architecture, and what makes it special in the Land of the Thunder Dragon..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
            <CardDescription>
              Provide the hotel's location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City name"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State or province"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country name"
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal/ZIP code"
                  className={errors.postalCode ? 'border-red-500' : ''}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">{errors.postalCode}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Hotel contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+975 2 123456"
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="hotel@bhutan.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.hotelbhutan.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hotel Details */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Details</CardTitle>
            <CardDescription>
              Additional hotel information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  name="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  className={errors.checkInTime ? 'border-red-500' : ''}
                />
                {errors.checkInTime && (
                  <p className="text-sm text-red-500">{errors.checkInTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  name="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  className={errors.checkOutTime ? 'border-red-500' : ''}
                />
                {errors.checkOutTime && (
                  <p className="text-sm text-red-500">{errors.checkOutTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminUserId">Admin User ID</Label>
                <Input
                  id="adminUserId"
                  name="adminUserId"
                  value={formData.adminUserId}
                  onChange={handleInputChange}
                  placeholder="Enter admin user ID"
                  className={errors.adminUserId ? 'border-red-500' : ''}
                />
                {errors.adminUserId && (
                  <p className="text-sm text-red-500">{errors.adminUserId}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">Hotel Status</Label>
              <Select
                id="isActive"
                name="isActive"
                value={formData.isActive}
                onChange={handleInputChange}
                className={errors.isActive ? 'border-red-500' : ''}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </Select>
              {errors.isActive && (
                <p className="text-sm text-red-500">{errors.isActive}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Services</CardTitle>
            <CardDescription>
              Select the amenities and services available at the hotel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.amenities.map((amenity) => {
                const IconComponent = amenity.icon;
                return (
                  <div key={amenity.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={amenity.key}
                      name={`amenities.${amenity.key}`}
                      checked={amenity.selected}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={amenity.key} className="flex items-center gap-2 text-sm">
                      <IconComponent className="h-4 w-4" />
                      {amenity.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rooms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Rooms Management
            </CardTitle>
            <CardDescription>
              Add and manage hotel rooms. At least one room is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formData.rooms.map((room, roomIndex) => (
              <div key={roomIndex} className="border rounded-lg p-4 mb-4 relative">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Room {roomIndex + 1}</h4>
                  {formData.rooms.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRoom(roomIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Basic Room Details */}
                  <div className="space-y-2">
                    <Label htmlFor={`room-${roomIndex}-roomNumber`}>Room Number *</Label>
                    <Input
                      id={`room-${roomIndex}-roomNumber`}
                      name={`rooms.${roomIndex}.roomNumber`}
                      value={room.roomNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 101, A1, Suite-1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`room-${roomIndex}-floor`}>Floor</Label>
                    <Input
                      id={`room-${roomIndex}-floor`}
                      name={`rooms.${roomIndex}.floor`}
                      type="number"
                      min="0"
                      value={room.floor}
                      onChange={handleInputChange}
                      placeholder="Floor number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`room-${roomIndex}-maxOccupancy`}>Max Occupancy *</Label>
                    <Input
                      id={`room-${roomIndex}-maxOccupancy`}
                      name={`rooms.${roomIndex}.maxOccupancy`}
                      type="number"
                      min="1"
                      value={room.maxOccupancy}
                      onChange={handleInputChange}
                      placeholder="Maximum guests"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`room-${roomIndex}-basePrice`}>Base Price *</Label>
                    <Input
                      id={`room-${roomIndex}-basePrice`}
                      name={`rooms.${roomIndex}.basePrice`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={room.basePrice}
                      onChange={handleInputChange}
                      placeholder="Price per night"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`room-${roomIndex}-status`}>Room Status</Label>
                    <Select
                      id={`room-${roomIndex}-status`}
                      name={`rooms.${roomIndex}.status`}
                      value={room.status}
                      onChange={handleInputChange}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="OUT_OF_ORDER">Out of Order</option>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`room-${roomIndex}-isActive`}>Active Status</Label>
                    <Select
                      id={`room-${roomIndex}-isActive`}
                      name={`rooms.${roomIndex}.isActive`}
                      value={room.isActive}
                      onChange={handleInputChange}
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </Select>
                  </div>
                </div>
                
                {/* Room Type Details */}
                <div className="mt-4">
                  <h5 className="text-md font-medium mb-3">Room Type Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`room-${roomIndex}-roomType-name`}>Room Type Name *</Label>
                      <Input
                        id={`room-${roomIndex}-roomType-name`}
                        name={`rooms.${roomIndex}.roomType.name`}
                        value={room.roomType.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Deluxe, Suite, Standard"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`room-${roomIndex}-roomType-bedCount`}>Bed Count *</Label>
                      <Input
                        id={`room-${roomIndex}-roomType-bedCount`}
                        name={`rooms.${roomIndex}.roomType.bedCount`}
                        type="number"
                        min="1"
                        value={room.roomType.bedCount}
                        onChange={handleInputChange}
                        placeholder="Number of beds"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`room-${roomIndex}-roomType-bedType`}>Bed Type *</Label>
                      <Select
                        id={`room-${roomIndex}-roomType-bedType`}
                        name={`rooms.${roomIndex}.roomType.bedType`}
                        value={room.roomType.bedType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select bed type</option>
                        <option value="SINGLE">Single</option>
                        <option value="DOUBLE">Double</option>
                        <option value="QUEEN">Queen</option>
                        <option value="KING">King</option>
                        <option value="TWIN">Twin</option>
                        <option value="SOFA_BED">Sofa Bed</option>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`room-${roomIndex}-roomType-roomSize`}>Room Size</Label>
                      <Input
                        id={`room-${roomIndex}-roomType-roomSize`}
                        name={`rooms.${roomIndex}.roomType.roomSize`}
                        value={room.roomType.roomSize}
                        onChange={handleInputChange}
                        placeholder="e.g., 25 sqm, 400 sq ft"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label htmlFor={`room-${roomIndex}-roomType-description`}>Room Type Description</Label>
                    <Textarea
                      id={`room-${roomIndex}-roomType-description`}
                      name={`rooms.${roomIndex}.roomType.description`}
                      value={room.roomType.description}
                      onChange={handleInputChange}
                      placeholder="Describe the room type features and amenities..."
                      rows={2}
                    />
                  </div>
                </div>
                
                {/* Room Description */}
                <div className="mt-4 space-y-2">
                  <Label htmlFor={`room-${roomIndex}-description`}>Room Description</Label>
                  <Textarea
                    id={`room-${roomIndex}-description`}
                    name={`rooms.${roomIndex}.description`}
                    value={room.description}
                    onChange={handleInputChange}
                    placeholder="Specific details about this particular room..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addRoom}
              className="w-full mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add More Room
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Hotel...' : 'Add Hotel'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddHotel;
