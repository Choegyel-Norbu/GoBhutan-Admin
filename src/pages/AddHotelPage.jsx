import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Building, MapPin, Phone, Mail, Star, Wifi, Car, Dumbbell, Coffee, Shield, Utensils } from 'lucide-react';

const AddHotel = () => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    // Basic Information
    hotelName: '',
    hotelChain: '',
    category: '',
    starRating: '',
    
    // Location Information
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    
    // Contact Information
    phone: '',
    email: '',
    website: '',
    
    // Hotel Details
    description: '',
    totalRooms: '',
    checkInTime: '',
    checkOutTime: '',
    
    // Amenities
    amenities: {
      wifi: false,
      parking: false,
      pool: false,
      gym: false,
      spa: false,
      restaurant: false,
      bar: false,
      businessCenter: false,
      conferenceRoom: false,
      airportShuttle: false,
      roomService: false,
      laundry: false,
      concierge: false,
      petFriendly: false,
      smokingAllowed: false
    },
    
    // Policies
    cancellationPolicy: '',
    petPolicy: '',
    smokingPolicy: '',
    
    // Pricing
    basePrice: '',
    currency: 'BTN',
    
    // Images
    images: []
  });

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'hotelName':
        if (!value.trim()) {
          newErrors.hotelName = 'Hotel name is required';
        } else if (value.trim().length < 2) {
          newErrors.hotelName = 'Hotel name must be at least 2 characters';
        } else {
          delete newErrors.hotelName;
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\+975\s?\d{1,2}\s?\d{6}$/.test(value.trim())) {
          newErrors.phone = 'Please enter a valid Bhutanese phone number (e.g., +975 2 123456)';
        } else {
          delete newErrors.phone;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else if (value.trim().length < 5) {
          newErrors.address = 'Address must be at least 5 characters';
        } else {
          delete newErrors.address;
        }
        break;
        
      case 'city':
        if (!value.trim()) {
          newErrors.city = 'City is required';
        } else if (value.trim().length < 2) {
          newErrors.city = 'City name must be at least 2 characters';
        } else {
          delete newErrors.city;
        }
        break;
        
      case 'country':
        if (!value.trim()) {
          newErrors.country = 'Country is required';
        } else if (value.trim().length < 2) {
          newErrors.country = 'Country name must be at least 2 characters';
        } else {
          delete newErrors.country;
        }
        break;
        
      case 'website':
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          newErrors.website = 'Website must start with http:// or https://';
        } else {
          delete newErrors.website;
        }
        break;
        
      case 'latitude':
        if (value && (isNaN(value) || value < -90 || value > 90)) {
          newErrors.latitude = 'Latitude must be between -90 and 90';
        } else {
          delete newErrors.latitude;
        }
        break;
        
      case 'longitude':
        if (value && (isNaN(value) || value < -180 || value > 180)) {
          newErrors.longitude = 'Longitude must be between -180 and 180';
        } else {
          delete newErrors.longitude;
        }
        break;
        
      case 'totalRooms':
        if (value && (isNaN(value) || value < 1 || value > 10000)) {
          newErrors.totalRooms = 'Total rooms must be between 1 and 10,000';
        } else {
          delete newErrors.totalRooms;
        }
        break;
        
      case 'basePrice':
        if (value && (isNaN(value) || value < 0)) {
          newErrors.basePrice = 'Base price must be a positive number';
        } else {
          delete newErrors.basePrice;
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
      const amenity = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [amenity]: checked
        }
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
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const validateForm = () => {
    const requiredFields = ['hotelName', 'phone', 'email', 'address', 'city', 'country'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'amenities' && key !== 'images') {
        validateField(key, formData[key]);
      }
    });
    
    return Object.keys(newErrors).length === 0 && Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    if (validateForm()) {
      try {
        console.log('Hotel data:', formData);
        // Here you would typically send the data to your API
        // const response = await api.addHotel(formData);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setSubmitMessage({ 
          type: 'success', 
          message: 'Hotel added successfully! You can now view it in the hotel listings.' 
        });
        
        // Reset form after successful submission
        setFormData({
          hotelName: '',
          hotelChain: '',
          category: '',
          starRating: '',
          address: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          latitude: '',
          longitude: '',
          phone: '',
          email: '',
          website: '',
          description: '',
          totalRooms: '',
          checkInTime: '',
          checkOutTime: '',
          amenities: {
            wifi: false,
            parking: false,
            pool: false,
            gym: false,
            spa: false,
            restaurant: false,
            bar: false,
            businessCenter: false,
            conferenceRoom: false,
            airportShuttle: false,
            roomService: false,
            laundry: false,
            concierge: false,
            petFriendly: false,
            smokingAllowed: false
          },
          cancellationPolicy: '',
          petPolicy: '',
          smokingPolicy: '',
          basePrice: '',
          currency: 'BTN',
          images: []
        });
        setErrors({});
        
      } catch (error) {
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

  const amenityOptions = [
    { key: 'wifi', label: 'Free WiFi', icon: Wifi },
    { key: 'parking', label: 'Free Parking', icon: Car },
    { key: 'pool', label: 'Swimming Pool', icon: Building },
    { key: 'gym', label: 'Fitness Center', icon: Dumbbell },
    { key: 'spa', label: 'Spa & Wellness', icon: Building },
    { key: 'restaurant', label: 'Restaurant', icon: Utensils },
    { key: 'bar', label: 'Bar/Lounge', icon: Coffee },
    { key: 'businessCenter', label: 'Business Center', icon: Building },
    { key: 'conferenceRoom', label: 'Conference Rooms', icon: Building },
    { key: 'airportShuttle', label: 'Airport Shuttle', icon: Car },
    { key: 'roomService', label: 'Room Service', icon: Utensils },
    { key: 'laundry', label: 'Laundry Service', icon: Building },
    { key: 'concierge', label: 'Concierge', icon: Shield },
    { key: 'petFriendly', label: 'Pet Friendly', icon: Building },
    { key: 'smokingAllowed', label: 'Smoking Allowed', icon: Building }
  ];

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
                <Label htmlFor="hotelName">Hotel Name *</Label>
                <Input
                  id="hotelName"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                  className={errors.hotelName ? 'border-red-500' : ''}
                />
                {errors.hotelName && (
                  <p className="text-sm text-red-500">{errors.hotelName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotelChain">Hotel Chain</Label>
                <Input
                  id="hotelChain"
                  name="hotelChain"
                  value={formData.hotelChain}
                  onChange={handleInputChange}
                  placeholder="e.g., Taj, Le Meridien, Aman"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select category</option>
                  <option value="luxury">Luxury</option>
                  <option value="business">Business</option>
                  <option value="boutique">Boutique</option>
                  <option value="budget">Budget</option>
                  <option value="resort">Resort</option>
                  <option value="airport">Airport</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="starRating">Star Rating</Label>
                <Select
                  id="starRating"
                  name="starRating"
                  value={formData.starRating}
                  onChange={handleInputChange}
                >
                  <option value="">Select rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </Select>
              </div>
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
                />
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
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 27.4728"
                  className={errors.latitude ? 'border-red-500' : ''}
                />
                {errors.latitude && (
                  <p className="text-sm text-red-500">{errors.latitude}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 89.6390"
                  className={errors.longitude ? 'border-red-500' : ''}
                />
                {errors.longitude && (
                  <p className="text-sm text-red-500">{errors.longitude}</p>
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
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+975 2 123456"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
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
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the hotel, its unique Bhutanese features, traditional architecture, and what makes it special in the Land of the Thunder Dragon..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalRooms">Total Rooms</Label>
                <Input
                  id="totalRooms"
                  name="totalRooms"
                  type="number"
                  value={formData.totalRooms}
                  onChange={handleInputChange}
                  placeholder="Number of rooms"
                  className={errors.totalRooms ? 'border-red-500' : ''}
                />
                {errors.totalRooms && (
                  <p className="text-sm text-red-500">{errors.totalRooms}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  name="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  name="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                />
              </div>
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
              {amenityOptions.map((amenity) => {
                const IconComponent = amenity.icon;
                return (
                  <div key={amenity.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={amenity.key}
                      name={`amenities.${amenity.key}`}
                      checked={formData.amenities[amenity.key]}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={amenity.key} className="flex items-center gap-2 text-sm">
                      <IconComponent className="h-4 w-4" />
                      {amenity.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Policies</CardTitle>
            <CardDescription>
              Define hotel policies and rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <Textarea
                id="cancellationPolicy"
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                placeholder="Describe the hotel's cancellation policy (e.g., Free cancellation up to 24 hours before check-in, 50% refund for same-day cancellations)..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petPolicy">Pet Policy</Label>
                <Textarea
                  id="petPolicy"
                  name="petPolicy"
                  value={formData.petPolicy}
                  onChange={handleInputChange}
                  placeholder="Pet policy details (e.g., Pets allowed with additional fee of Nu 500 per night, maximum 2 pets per room)..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smokingPolicy">Smoking Policy</Label>
                <Textarea
                  id="smokingPolicy"
                  name="smokingPolicy"
                  value={formData.smokingPolicy}
                  onChange={handleInputChange}
                  placeholder="Smoking policy details (e.g., Non-smoking hotel, designated smoking areas available, fine of Nu 2000 for smoking in rooms)..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
            <CardDescription>
              Set base pricing for the hotel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (per night)</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  className={errors.basePrice ? 'border-red-500' : ''}
                />
                {errors.basePrice && (
                  <p className="text-sm text-red-500">{errors.basePrice}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  <option value="BTN">BTN (Nu)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Images</CardTitle>
            <CardDescription>
              Upload images of the hotel (facade, rooms, amenities, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images</Label>
                <Input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
              </div>
              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Images:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
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
            {isSubmitting ? 'Adding Hotel...' : 'Add Hotel'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddHotel;
