import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Building, MapPin, Phone, Mail, Star, Wifi, Car, Dumbbell, Coffee, Shield, Utensils, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

const AddHotel = () => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      amenities: amenityOptions,
      rooms: [{
        id: 0,
        roomNumber: '',
        hotel: '',
        roomType: {
          id: 0,
          name: '',
          description: '',
          bedCount: '',
          bedType: '',
          roomSize: ''
        },
        floor: '',
        basePrice: '',
        maxOccupancy: '',
        status: 'AVAILABLE',
        isActive: true,
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    });
    setErrors({});
  };
  
  // Define room type options
  const roomTypeOptions = [
    { value: 'STANDARD', label: 'Standard Room', bedCount: 1, bedType: 'SINGLE', roomSize: '20-25 sqm' },
    { value: 'DELUXE', label: 'Deluxe Room', bedCount: 1, bedType: 'QUEEN', roomSize: '30-35 sqm' },
    { value: 'SUPERIOR', label: 'Superior Room', bedCount: 1, bedType: 'KING', roomSize: '35-40 sqm' },
    { value: 'SUITE', label: 'Suite', bedCount: 1, bedType: 'KING', roomSize: '50+ sqm' },
    { value: 'FAMILY', label: 'Family Room', bedCount: 2, bedType: 'DOUBLE', roomSize: '40-45 sqm' },
    { value: 'TWIN', label: 'Twin Room', bedCount: 2, bedType: 'TWIN', roomSize: '25-30 sqm' },
    { value: 'APARTMENT', label: 'Apartment', bedCount: 1, bedType: 'QUEEN', roomSize: '60+ sqm' },
    { value: 'VILLA', label: 'Villa', bedCount: 2, bedType: 'KING', roomSize: '100+ sqm' }
  ];

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
        bedCount: '',
        bedType: '',
        roomSize: ''
      },
      floor: '',
      basePrice: '',
      maxOccupancy: '',
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
        const newErrors = { ...errors };
        const errorKey = `rooms_${roomIndex}_${fieldPath[0]}`;
        const fieldValue = type === 'checkbox' ? checked : value;
        
        // Validate specific room fields
        if (fieldPath[0] === 'roomNumber') {
          if (!fieldValue || !fieldValue.trim()) {
            newErrors[errorKey] = 'Room number is required';
          } else if (fieldValue.trim().length > 20) {
            newErrors[errorKey] = 'Room number must be less than 20 characters';
          } else {
            delete newErrors[errorKey];
          }
        } else if (fieldPath[0] === 'basePrice') {
          if (!fieldValue || isNaN(fieldValue) || parseFloat(fieldValue) <= 0) {
            newErrors[errorKey] = 'Base price must be a positive number';
          } else {
            delete newErrors[errorKey];
          }
        } else if (fieldPath[0] === 'maxOccupancy') {
          if (!fieldValue || isNaN(fieldValue) || parseInt(fieldValue) <= 0) {
            newErrors[errorKey] = 'Max occupancy must be a positive number';
          } else {
            delete newErrors[errorKey];
          }
        } else if (fieldPath[0] === 'floor') {
          if (fieldValue && (isNaN(fieldValue) || parseInt(fieldValue) < 0)) {
            newErrors[errorKey] = 'Floor must be zero or a positive number';
          } else {
            delete newErrors[errorKey];
          }
        } else {
          // For other fields, just clear any existing errors
          delete newErrors[errorKey];
        }
        
        setErrors(newErrors);
      } else if (fieldPath.length === 2 && fieldPath[0] === 'roomType') {
        const newErrors = { ...errors };
        const errorKey = `rooms_${roomIndex}_roomType_${fieldPath[1]}`;
        const fieldValue = type === 'checkbox' ? checked : value;
        
        // Validate room type fields
        if (fieldPath[1] === 'name') {
          if (!fieldValue || !fieldValue.trim()) {
            newErrors[errorKey] = 'Room type is required';
          } else {
            delete newErrors[errorKey];
          }
        } else if (fieldPath[1] === 'bedCount') {
          if (!fieldValue || isNaN(fieldValue) || parseInt(fieldValue) <= 0) {
            newErrors[errorKey] = 'Bed count must be a positive number';
          } else {
            delete newErrors[errorKey];
          }
        } else if (fieldPath[1] === 'bedType') {
          if (!fieldValue || !fieldValue.trim()) {
            newErrors[errorKey] = 'Bed type is required';
          } else {
            delete newErrors[errorKey];
          }
        } else {
          // For other fields, just clear any existing errors
          delete newErrors[errorKey];
        }
        
        setErrors(newErrors);
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
        bedCount: '',
        bedType: '',
        roomSize: ''
      },
      floor: '',
      basePrice: '',
      maxOccupancy: '',
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
      
      // Clear validation errors for the removed room
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.includes(`rooms_${roomIndex}_`)) {
          delete newErrors[key];
        }
      });
      
      // Adjust room indices for remaining rooms' errors
      const adjustedErrors = {};
      Object.keys(newErrors).forEach(key => {
        if (key.includes('rooms_')) {
          const parts = key.split('_');
          const roomIdx = parseInt(parts[1]);
          if (roomIdx > roomIndex) {
            // Shift room index down by 1
            const newKey = key.replace(`rooms_${roomIdx}_`, `rooms_${roomIdx - 1}_`);
            adjustedErrors[newKey] = newErrors[key];
          } else if (roomIdx < roomIndex) {
            // Keep existing validation errors for rooms before removed room
            adjustedErrors[key] = newErrors[key];
          }
          // Skip errors for the removed room (roomIdx === roomIndex)
        } else {
          // Keep non-room errors
          adjustedErrors[key] = newErrors[key];
        }
      });
      
      setErrors(adjustedErrors);
    }
  };

  const handleRoomTypeChange = (roomIndex, roomTypeValue) => {
    const selectedRoomType = roomTypeOptions.find(option => option.value === roomTypeValue);
    
    if (selectedRoomType) {
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map((room, index) => {
          if (index === roomIndex) {
            return {
              ...room,
              roomType: {
                ...room.roomType,
                name: selectedRoomType.value,
                bedCount: selectedRoomType.bedCount,
                bedType: selectedRoomType.bedType,
                roomSize: selectedRoomType.roomSize
              }
            };
          }
          return room;
        })
      }));
      
      // Clear validation errors for room type fields
      const newErrors = { ...errors };
      delete newErrors[`rooms_${roomIndex}_roomType_name`];
      delete newErrors[`rooms_${roomIndex}_roomType_bedCount`];
      delete newErrors[`rooms_${roomIndex}_roomType_bedType`];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const allErrors = {};
    
    // Validate all basic fields
    Object.keys(formData).forEach(key => {
      if (key !== 'amenities' && key !== 'rooms') {
        const fieldErrors = validateFieldSync(key, formData[key]);
        if (fieldErrors) {
          allErrors[key] = fieldErrors;
        }
      }
    });
    
    // Validate rooms
    const roomFieldPrefix = 'rooms_';
    formData.rooms.forEach((room, roomIndex) => {
      // Required room fields
      const requiredRoomFields = ['roomNumber', 'basePrice', 'maxOccupancy'];
      const optionalRoomFields = ['floor'];
      const requiredRoomTypeFields = ['name', 'bedCount', 'bedType'];
      
      // Validate required room fields
      requiredRoomFields.forEach(fieldName => {
        const value = room[fieldName];
        const errorKey = `${roomFieldPrefix}${roomIndex}_${fieldName}`;
        
        if (!value || (typeof value === 'string' && !value.trim())) {
          allErrors[errorKey] = `${fieldName === 'roomNumber' ? 'Room number' : 
                                fieldName === 'basePrice' ? 'Base price' : 
                                'Max occupancy'} is required`;
        } else if (fieldName === 'basePrice' && (isNaN(value) || parseFloat(value) <= 0)) {
          allErrors[errorKey] = 'Base price must be a positive number';
        } else if (fieldName === 'maxOccupancy' && (isNaN(value) || parseInt(value) <= 0)) {
          allErrors[errorKey] = 'Max occupancy must be a positive number';
        }
      });
      
      // Validate optional room fields
      optionalRoomFields.forEach(fieldName => {
        const value = room[fieldName];
        const errorKey = `${roomFieldPrefix}${roomIndex}_${fieldName}`;
        
        if (fieldName === 'floor' && value && (isNaN(value) || parseInt(value) < 0)) {
          allErrors[errorKey] = 'Floor must be zero or a positive number';
        }
      });
      
      // Validate required room type fields
      requiredRoomTypeFields.forEach(fieldName => {
        const value = room.roomType[fieldName];
        const errorKey = `${roomFieldPrefix}${roomIndex}_roomType_${fieldName}`;
        
        if (!value || (typeof value === 'string' && !value.trim())) {
          allErrors[errorKey] = `${fieldName === 'name' ? 'Room type' : 
                                fieldName === 'bedCount' ? 'Bed count' : 
                                'Bed type'} is required`;
        } else if (fieldName === 'bedCount' && (isNaN(value) || parseInt(value) <= 0)) {
          allErrors[errorKey] = 'Bed count must be a positive number';
        }
      });
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
    const sortedErrorKeys = errorKeys.sort((a, b) => {
      // Define field priority order
      const fieldOrder = ['name', 'description', 'starRating', 'address', 'city', 'state', 'country', 'postalCode', 'phoneNumber', 'email', 'website', 'checkInTime', 'checkOutTime'];
      
      // Extract field name from error key
      let fieldA = a.includes('rooms_') ? a.split('_')[0] : a;
      let fieldB = b.includes('rooms_') ? b.split('_')[0] : b;
      
      const indexA = fieldOrder.indexOf(fieldA);
      const indexB = fieldOrder.indexOf(fieldB);
      
      // If both fields are in the order, sort by that order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      
      // Basic fields come before room fields
      if (!a.includes('rooms_') && b.includes('rooms_')) return -1;
      if (a.includes('rooms_') && !b.includes('rooms_')) return 1;
      
      // Within room fields, sort by room index
      if (a.includes('rooms_') && b.includes('rooms_')) {
        const roomIndexA = parseInt(a.split('_')[1]);
        const roomIndexB = parseInt(b.split('_')[1]);
        if (roomIndexA !== roomIndexB) return roomIndexA - roomIndexB;
        
        // Within same room, sort by field type
        const fieldOrderInRoom = ['roomNumber', 'basePrice', 'maxOccupancy', 'roomType_name', 'roomType_bedCount', 'roomType_bedType'];
        const fieldA = a.split('_').pop();
        const fieldB = b.split('_').pop();
        const indexA = fieldOrderInRoom.indexOf(fieldA);
        const indexB = fieldOrderInRoom.indexOf(fieldB);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      }
      
      return a.localeCompare(b);
    });
    
    const firstErrorKey = sortedErrorKeys[0];
    let elementToScroll = null;
    
    if (firstErrorKey.includes('rooms_')) {
      // Room field error
      const parts = firstErrorKey.split('_');
      const roomIndex = parts[1];
      const fieldName = parts[2] ? parts[2] : parts.slice(2).join('_');
      
      // Map field names to IDs
      const fieldIdMap = {
        'roomNumber': `room-${roomIndex}-roomNumber`,
        'basePrice': `room-${roomIndex}-basePrice`,
        'maxOccupancy': `room-${roomIndex}-maxOccupancy`,
        'roomType_name': `room-${roomIndex}-roomType`,
        'roomType_bedCount': `room-${roomIndex}-roomType-bedCount`,
        'roomType_bedType': `room-${roomIndex}-roomType-bedType`,
      };
      
      const elementId = fieldIdMap[firstErrorKey.replace(`rooms_${roomIndex}_`, '')];
      elementToScroll = document.getElementById(elementId);
      
      // If direct ID doesn't work, try the parent room container
      if (!elementToScroll) {
        const roomContainer = document.querySelector(`input[name="rooms.${roomIndex}.roomNumber"]`)?.closest('.border.rounded-lg.p-4.mb-4');
        elementToScroll = roomContainer;
      }
    } else {
      // Basic field error
      elementToScroll = document.getElementById(firstErrorKey);
    }
    
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
        // Format the data according to the API schema
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
          rooms: formData.rooms.map((room) => ({
            roomNumber: room.roomNumber,
            roomType: {
              name: room.roomType.name,
              bedCount: room.roomType.bedCount ? parseInt(room.roomType.bedCount) : 0,
              bedType: room.roomType.bedType,
              roomSize: room.roomType.roomSize
            },
            floor: room.floor ? parseInt(room.floor) : 0,
            basePrice: room.basePrice ? parseFloat(room.basePrice) : 0,
            maxOccupancy: room.maxOccupancy ? parseInt(room.maxOccupancy) : 0,
            status: room.status,
            isActive: room.isActive,
            description: room.description
          })),
          amenities: formData.amenities.filter(amenity => amenity.selected).map(amenity => ({
            name: amenity.name,
            description: amenity.description,
            iconClass: amenity.iconClass,
            category: amenity.category
          }))
        };

        console.log('Hotel payload:', payload);
        
        // Get stored token and set it on the API client
        const token = authAPI.getStoredToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        
        // Make API call to POST /api/v1/hotels
        console.log('Making API call to:', API_CONFIG.ENDPOINTS.HOTEL.HOTELS);
        console.log('Request payload:', payload);
        
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.HOTEL.HOTELS, payload);
        
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
    <div className="container mx-auto p-0 md:p-6">

      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          Add New Hotel
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete the form below to add a new hotel to the system
        </p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Basic Information</CardTitle>
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
            <CardTitle className="flex items-center gap-2 text-md">
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
            <CardTitle className="flex items-center gap-2 text-md">
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
            <CardTitle className="text-md">Hotel Details</CardTitle>
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
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Amenities & Services</CardTitle>
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
            <CardTitle className="flex items-center gap-2 text-md">
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
                      className={errors[`rooms_${roomIndex}_roomNumber`] ? 'border-red-500' : ''}
                    />
                    {errors[`rooms_${roomIndex}_roomNumber`] && (
                      <p className="text-sm text-red-500">{errors[`rooms_${roomIndex}_roomNumber`]}</p>
                    )}
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
                      placeholder="Floor number (optional)"
                      className={errors[`rooms_${roomIndex}_floor`] ? 'border-red-500' : ''}
                    />
                    {errors[`rooms_${roomIndex}_floor`] && (
                      <p className="text-sm text-red-500">{errors[`rooms_${roomIndex}_floor`]}</p>
                    )}
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
                      className={errors[`rooms_${roomIndex}_maxOccupancy`] ? 'border-red-500' : ''}
                    />
                    {errors[`rooms_${roomIndex}_maxOccupancy`] && (
                      <p className="text-sm text-red-500">{errors[`rooms_${roomIndex}_maxOccupancy`]}</p>
                    )}
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
                      className={errors[`rooms_${roomIndex}_basePrice`] ? 'border-red-500' : ''}
                    />
                    {errors[`rooms_${roomIndex}_basePrice`] && (
                      <p className="text-sm text-red-500">{errors[`rooms_${roomIndex}_basePrice`]}</p>
                    )}
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
                      <Label htmlFor={`room-${roomIndex}-roomType`}>Room Type *</Label>
                      <Select
                        id={`room-${roomIndex}-roomType`}
                        value={room.roomType.name}
                        onChange={(e) => handleRoomTypeChange(roomIndex, e.target.value)}
                        className={errors[`rooms_${roomIndex}_roomType_name`] ? 'border-red-500' : ''}
                      >
                        <option value="">Select room type</option>
                        {roomTypeOptions.map((roomType) => (
                          <option key={roomType.value} value={roomType.value}>
                            {roomType.label}
                          </option>
                        ))}
                      </Select>
                      {errors[`rooms_${roomIndex}_roomType_name`] && (
                        <p className="text-sm text-red-500">{errors[`rooms_${roomIndex}_roomType_name`]}</p>
                      )}
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
                        className={errors[`rooms_${roomIndex}_roomType_bedCount`] ? 'border-red-500' : ''}
                      />
                      {errors[`rooms_${roomIndex}_roomType_bedCount`] && (
                        <p className="text-sm text-red-500">{errors[`rooms_${roomIndex}_roomType_bedCount`]}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`room-${roomIndex}-roomType-bedType`}>Bed Type *</Label>
                      <Select
                        id={`room-${roomIndex}-roomType-bedType`}
                        name={`rooms.${roomIndex}.roomType.bedType`}
                        value={room.roomType.bedType}
                        onChange={handleInputChange}
                        className={errors[`rooms_${roomIndex}_roomType_bedType`] ? 'border-red-500' : ''}
                      >
                        <option value="">Select bed type</option>
                        <option value="SINGLE">Single</option>
                        <option value="DOUBLE">Double</option>
                        <option value="QUEEN">Queen</option>
                        <option value="KING">King</option>
                        <option value="TWIN">Twin</option>
                        <option value="SOFA_BED">Sofa Bed</option>
                      </Select>
                      {errors[`rooms_${roomIndex}_roomType_bedType`] && (
                        <p className="text-sm text-red-500">{errors[`rooms_${roomIndex}_roomType_bedType`]}</p>
                      )}
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
