import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Settings, Building2, Wifi, Car, Coffee, Shield, Utensils, Save, RefreshCw, MapPin, Loader2, ArrowLeft, Phone, Clock } from 'lucide-react';
import { apiClient, api } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

const HotelSettingsPage = () => {
  // View states: 'hotels' | 'settings'
  const [currentView, setCurrentView] = useState('hotels');
  const [selectedHotel, setSelectedHotel] = useState(null);
  
  // Data states
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [settings, setSettings] = useState({
    // Basic Information (matching AddHotelPage)
    hotelName: '',
    description: '',
    starRating: 0,
    
    // Location Information
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    
    // Contact Information
    phone: '',
    email: '',
    website: '',
    
    // Hotel Details
    checkInTime: '',
    checkOutTime: '',
    
    // Amenities (boolean object for form handling)
    amenities: {
      wifi: false,
      parking: false,
      pool: false,
      gym: false,
      spa: false,
      restaurant: false,
      bar: false,
      businessCenter: false,
      roomService: false,
      concierge: false,
      laundry: false,
      airportShuttle: false,
      petFriendly: false,
      smokingAllowed: false
    }
  });

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      const response = await api.hotel.getHotels();
      const hotelsData = response.data || response;
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to load hotels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
    
    // Convert amenities array to boolean object for form handling
    const convertAmenitiesFromAPI = (amenitiesArray) => {
      const amenitiesObj = {
        wifi: false,
        parking: false,
        pool: false,
        gym: false,
        spa: false,
        restaurant: false,
        bar: false,
        businessCenter: false,
        roomService: false,
        concierge: false,
        laundry: false,
        valet: false,
        airportShuttle: false,
        petFriendly: false,
        smokingAllowed: false
      };
      
      if (Array.isArray(amenitiesArray)) {
        amenitiesArray.forEach(amenity => {
          const amenityName = amenity.name?.toLowerCase().replace(/\s+/g, '');
          switch (amenityName) {
            case 'wifi':
              amenitiesObj.wifi = true;
              break;
            case 'parking':
              amenitiesObj.parking = true;
              break;
            case 'swimmingpool':
              amenitiesObj.pool = true;
              break;
            case 'fitnesscenter':
              amenitiesObj.gym = true;
              break;
            case 'spaservices':
              amenitiesObj.spa = true;
              break;
            case 'restaurant':
              amenitiesObj.restaurant = true;
              break;
            case 'bar':
              amenitiesObj.bar = true;
              break;
            case 'businesscenter':
              amenitiesObj.businessCenter = true;
              break;
            case 'roomservice':
              amenitiesObj.roomService = true;
              break;
            case 'concierge':
              amenitiesObj.concierge = true;
              break;
            case 'laundryservice':
              amenitiesObj.laundry = true;
              break;
            case 'valetparking':
              amenitiesObj.valet = true;
              break;
            case 'airportshuttle':
              amenitiesObj.airportShuttle = true;
              break;
            case 'petfriendly':
              amenitiesObj.petFriendly = true;
              break;
            case 'smokingallowed':
              amenitiesObj.smokingAllowed = true;
              break;
          }
        });
      }
      
      return amenitiesObj;
    };
    
    // Populate settings with hotel data (only fields present in AddHotelPage)
    setSettings({
      // Basic Information
      hotelName: hotel.name || '',
      description: hotel.description || '',
      starRating: hotel.starRating || 0,
      
      // Location Information
      address: hotel.address || '',
      city: hotel.city || '',
      state: hotel.state || '',
      country: hotel.country || 'Bhutan',
      postalCode: hotel.postalCode || '',
      
      // Contact Information
      phone: hotel.phoneNumber || '',
      email: hotel.email || '',
      website: hotel.website || '',
      
      // Hotel Details
      checkInTime: hotel.checkInTime || '',
      checkOutTime: hotel.checkOutTime || '',
      
      // Amenities - Convert from API format to form format
      amenities: convertAmenitiesFromAPI(hotel.amenities)
    });
    setCurrentView('settings');
  };

  const handleBackToHotels = () => {
    setCurrentView('hotels');
    setSelectedHotel(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('amenities.')) {
      const amenityKey = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [amenityKey]: checked
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setSettings(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  // Helper function to convert amenities to API format
  const convertAmenitiesToAPIFormat = (amenities) => {
    const amenityMapping = {
      wifi: { name: 'WiFi', description: 'Free WiFi internet access', iconClass: 'wifi', category: 'BASIC' },
      parking: { name: 'Parking', description: 'Free parking available', iconClass: 'car', category: 'BASIC' },
      pool: { name: 'Swimming Pool', description: 'Outdoor swimming pool', iconClass: 'pool', category: 'RECREATION' },
      gym: { name: 'Fitness Center', description: '24/7 fitness center', iconClass: 'dumbbell', category: 'RECREATION' },
      spa: { name: 'Spa Services', description: 'Full-service spa and wellness center', iconClass: 'spa', category: 'WELLNESS' },
      restaurant: { name: 'Restaurant', description: 'On-site restaurant', iconClass: 'utensils', category: 'DINING' },
      bar: { name: 'Bar', description: 'Cocktail bar and lounge', iconClass: 'wine-glass', category: 'DINING' },
      businessCenter: { name: 'Business Center', description: 'Business center with meeting rooms', iconClass: 'briefcase', category: 'BUSINESS' },
      roomService: { name: 'Room Service', description: '24/7 room service', iconClass: 'room-service', category: 'SERVICE' },
      concierge: { name: 'Concierge', description: 'Concierge services', iconClass: 'concierge', category: 'SERVICE' },
      laundry: { name: 'Laundry Service', description: 'Laundry and dry cleaning services', iconClass: 'tshirt', category: 'SERVICE' },
      valet: { name: 'Valet Parking', description: 'Valet parking service', iconClass: 'valet', category: 'SERVICE' },
      airportShuttle: { name: 'Airport Shuttle', description: 'Complimentary airport shuttle', iconClass: 'shuttle-van', category: 'TRANSPORTATION' },
      petFriendly: { name: 'Pet Friendly', description: 'Pet-friendly accommodations', iconClass: 'paw', category: 'POLICY' },
      smokingAllowed: { name: 'Smoking Allowed', description: 'Smoking rooms available', iconClass: 'smoking', category: 'POLICY' }
    };

    return Object.entries(amenities)
      .filter(([key, enabled]) => enabled)
      .map(([key, enabled]) => ({
        id: 0, // Will be assigned by backend
        ...amenityMapping[key],
        name: amenityMapping[key].name,
        description: amenityMapping[key].description,
        iconClass: amenityMapping[key].iconClass,
        category: amenityMapping[key].category
      }));
  };

  const handleSave = async () => {
    if (!selectedHotel) {
      setSubmitMessage({
        type: 'error',
        message: 'No hotel selected. Please select a hotel first.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }

      // Prepare hotel data for update - only include fields present in AddHotelPage
      const hotelUpdateData = {
        name: settings.hotelName,
        description: settings.description || '',
        address: settings.address,
        city: settings.city,
        state: settings.state,
        country: settings.country,
        postalCode: settings.postalCode,
        phoneNumber: settings.phone,
        email: settings.email,
        website: settings.website,
        starRating: parseInt(settings.starRating) || 0,
        checkInTime: settings.checkInTime,
        checkOutTime: settings.checkOutTime,
        rooms: selectedHotel.rooms || [], // Keep existing rooms
        amenities: convertAmenitiesToAPIFormat(settings.amenities)
      };

      // Show loading alert
      Swal.fire({
        title: 'Updating Hotel...',
        text: 'Please wait while we update hotel settings.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await api.hotel.updateHotel(selectedHotel.id, hotelUpdateData);
      
      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Hotel Updated Successfully!',
        text: `Hotel settings for ${selectedHotel.name} have been updated.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });
      
      setSubmitMessage({
        type: 'success',
        message: 'Hotel settings updated successfully!'
      });
      
    } catch (error) {
      console.error('Error updating hotel:', error);
      
      // Show error alert
      let errorMessage = 'Failed to update hotel settings. Please try again.';
      
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
      
      setSubmitMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitMessage({ type: '', message: '' });
    // Reset to default values
    window.location.reload();
  };

  const categories = [
    'Budget',
    'Economy',
    'Mid-range',
    'Upscale',
    'Luxury',
    'Boutique',
    'Resort',
    'Business'
  ];

  const starRatings = ['1', '2', '3', '4', '5'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'BTN'];
  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'];

  // Hotels List View
  const renderHotelsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Hotel Settings</h1>
          <p className="text-muted-foreground">Select a hotel to configure its settings</p>
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading hotels...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              <p className="font-medium">Error loading hotels</p>
              <p className="text-sm mt-1">{error}</p>
              <Button onClick={fetchHotels} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && hotels.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No hotels found</p>
              <p className="text-sm mt-1">No hotels are currently registered in the system.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && hotels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Card 
              key={hotel.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleHotelClick(hotel)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <Building2 className="h-5 w-5" />
                  {hotel.name}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-4 w-4" />
                    {hotel.address || 'Address not available'}
                  </div>
                  {hotel.description && (
                    <p className="text-sm">{hotel.description}</p>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hotel.phoneNumber && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="text-sm">{hotel.phoneNumber}</span>
                    </div>
                  )}
                  {hotel.email && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{hotel.email}</span>
                    </div>
                  )}
                  {hotel.category && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Category:</span>
                      <span className="text-sm">{hotel.category}</span>
                    </div>
                  )}
                  {hotel.starRating && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Rating:</span>
                      <span className="text-sm">{hotel.starRating} Star{hotel.starRating !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Settings Form View
  const renderSettingsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Hotel Settings</h1>
            <p className="text-muted-foreground">Configure settings for {selectedHotel?.name}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleBackToHotels}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hotels
        </Button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Basic hotel information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelName">Hotel Name *</Label>
                <Input
                  id="hotelName"
                  name="hotelName"
                  value={settings.hotelName}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starRating">Star Rating</Label>
                <Select
                  name="starRating"
                  value={settings.starRating}
                  onChange={(e) => handleSelectChange('starRating', parseInt(e.target.value))}
                >
                  <option value={0}>Select rating</option>
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={settings.description}
                onChange={handleInputChange}
                placeholder="Describe the hotel..."
                rows={4}
              />
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
              Hotel location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={settings.city}
                  onChange={handleInputChange}
                  placeholder="City name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={settings.state}
                  onChange={handleInputChange}
                  placeholder="State or province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={settings.country}
                  onChange={handleInputChange}
                  placeholder="Country name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={settings.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal/ZIP code"
                />
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
                  value={settings.phone}
                  onChange={handleInputChange}
                  placeholder="+975 2 123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  placeholder="hotel@bhutan.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={settings.website}
                onChange={handleInputChange}
                placeholder="https://www.hotelbhutan.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hotel Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hotel Details
            </CardTitle>
            <CardDescription>
              Additional hotel information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  name="checkInTime"
                  type="time"
                  value={settings.checkInTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  name="checkOutTime"
                  type="time"
                  value={settings.checkOutTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Amenities & Services
            </CardTitle>
            <CardDescription>
              Select the amenities and services available at the hotel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(settings.amenities).map(([amenity, enabled]) => {
                const amenityNames = {
                  wifi: 'Free WiFi',
                  parking: 'Free Parking',
                  pool: 'Swimming Pool',
                  gym: 'Fitness Center',
                  spa: 'Spa & Wellness',
                  restaurant: 'Restaurant',
                  bar: 'Bar/Lounge',
                  businessCenter: 'Business Center',
                  roomService: 'Room Service',
                  concierge: 'Concierge',
                  laundry: 'Laundry Service',
                  airportShuttle: 'Airport Shuttle',
                  petFriendly: 'Pet Friendly',
                  smokingAllowed: 'Smoking Allowed'
                };
                
                return (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={amenity}
                      name={`amenities.${amenity}`}
                      checked={enabled}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={amenity} className="text-sm">
                      {amenityNames[amenity] || amenity}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleBackToHotels}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Updating...' : 'Update Hotel'}
          </Button>
        </div>

        {/* Submit Message */}
        {submitMessage.message && (
          <div className={`p-4 rounded-lg ${
            submitMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {submitMessage.message}
          </div>
        )}
      </form>
    </div>
  );

  return (
    <div className="container mx-auto p-0 md:p-6">
      {currentView === 'hotels' && renderHotelsView()}
      {currentView === 'settings' && renderSettingsView()}
    </div>
  );
};

export default HotelSettingsPage;
