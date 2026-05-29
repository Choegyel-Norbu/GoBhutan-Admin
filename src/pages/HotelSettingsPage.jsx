import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Settings, Building2, Wifi, Car, Coffee, Shield, Utensils, Save, RefreshCw, MapPin, ArrowLeft, Phone, Clock, Trash2, Mail } from 'lucide-react';
import { apiClient, api } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import { getHotelPrimaryImage } from '@/lib/utils';
import AuthenticatedImage from '@/components/AuthenticatedImage';
import PageWrapper from '@/components/PageWrapper';
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

  // Scroll main content area to top on every view change
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }, [currentView]);

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
  // Categories must match backend enum: BASIC, RECREATION, WELLNESS, DINING, BUSINESS
  const convertAmenitiesToAPIFormat = (amenities) => {
    const amenityMapping = {
      wifi: { name: 'WiFi', description: 'Free WiFi internet access', iconClass: 'fa-wifi', category: 'BASIC' },
      parking: { name: 'Free Parking', description: 'Complimentary parking for guests', iconClass: 'fa-car', category: 'BASIC' },
      pool: { name: 'Swimming Pool', description: 'Olympic-sized outdoor pool', iconClass: 'fa-swimming-pool', category: 'RECREATION' },
      gym: { name: 'Fitness Center', description: 'Well-equipped fitness center', iconClass: 'fa-dumbbell', category: 'RECREATION' },
      spa: { name: 'Spa & Wellness', description: 'Full-service spa with massage therapies', iconClass: 'fa-spa', category: 'WELLNESS' },
      restaurant: { name: 'Restaurant', description: 'On-site dining restaurant', iconClass: 'utensils', category: 'DINING' },
      bar: { name: 'Bar/Lounge', description: 'Bar and lounge area', iconClass: 'coffee', category: 'DINING' },
      businessCenter: { name: 'Business Center', description: 'Business center with meeting facilities', iconClass: 'building', category: 'BUSINESS' },
      roomService: { name: 'Room Service', description: '24/7 room service available', iconClass: 'utensils', category: 'BASIC' },
      concierge: { name: 'Concierge', description: 'Professional concierge services', iconClass: 'shield', category: 'BASIC' },
      laundry: { name: 'Laundry Service', description: 'Laundry and dry cleaning services', iconClass: 'building', category: 'BASIC' },
      valet: { name: 'Valet Parking', description: 'Valet parking service', iconClass: 'car', category: 'BASIC' },
      airportShuttle: { name: 'Airport Shuttle', description: 'Complimentary airport shuttle service', iconClass: 'car', category: 'BASIC' },
      petFriendly: { name: 'Pet Friendly', description: 'Pet-friendly accommodations', iconClass: 'building', category: 'BASIC' },
      smokingAllowed: { name: 'Smoking Allowed', description: 'Designated smoking areas', iconClass: 'building', category: 'BASIC' }
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

      // Create FormData with flat fields (same format as AddHotelPage)
      const formData = new FormData();

      // Add basic hotel information as flat form-data fields
      formData.append('name', settings.hotelName);
      formData.append('description', settings.description || '');
      formData.append('address', settings.address);
      formData.append('city', settings.city);
      formData.append('state', settings.state || '');
      formData.append('country', settings.country);
      formData.append('postalCode', settings.postalCode || '');
      formData.append('phoneNumber', settings.phone);
      formData.append('email', settings.email);
      formData.append('website', settings.website || '');
      formData.append('starRating', (parseInt(settings.starRating) || 0).toString());
      formData.append('checkInTime', settings.checkInTime || '');
      formData.append('checkOutTime', settings.checkOutTime || '');

      // Add amenities as indexed array entries
      const selectedAmenities = convertAmenitiesToAPIFormat(settings.amenities);
      selectedAmenities.forEach((amenity, index) => {
        formData.append(`amenities[${index}].name`, amenity.name);
        formData.append(`amenities[${index}].description`, amenity.description);
        const iconClass = amenity.iconClass.startsWith('fa-')
          ? amenity.iconClass
          : `fa-${amenity.iconClass}`;
        formData.append(`amenities[${index}].iconClass`, iconClass);
        formData.append(`amenities[${index}].category`, amenity.category);
      });

      // Log form data entries for debugging
      console.log('Update Hotel FormData:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? value.name : value);
      }

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

      // Call API with FormData - no deleteImageIds for now
      const response = await api.hotel.updateHotel(selectedHotel.id, formData, []);

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

      // Refresh hotels list to get updated data
      await fetchHotels();

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

  const handleDelete = async () => {
    if (!selectedHotel) {
      setSubmitMessage({
        type: 'error',
        message: 'No hotel selected. Please select a hotel first.'
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Delete Hotel',
      text: `Are you sure you want to delete "${selectedHotel.name}"? This action cannot be undone and will also delete all associated rooms and bookings.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete Hotel',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });

    try {
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }

      // Show loading alert
      Swal.fire({
        title: 'Deleting Hotel...',
        text: 'Please wait while we delete the hotel.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await api.hotel.deleteHotel(selectedHotel.id);

      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Hotel Deleted Successfully!',
        text: `Hotel "${selectedHotel.name}" has been deleted.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });

      // Go back to hotels list and refresh
      setCurrentView('hotels');
      setSelectedHotel(null);
      await fetchHotels();

    } catch (error) {
      console.error('Error deleting hotel:', error);

      // Show error alert
      let errorMessage = 'Failed to delete hotel. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
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
    <PageWrapper
      title="Hotel Settings"
      description="Select a hotel to configure its settings"
      icon={Settings}
    >
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading hotels...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p className="font-medium text-destructive">Error loading hotels</p>
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
          {hotels.map((hotel) => {
            const hotelImageUrl = getHotelPrimaryImage(hotel.images);
            return (
              <Card
                key={hotel.id}
                className="hover:border-primary/30 transition-colors overflow-hidden cursor-pointer"
                onClick={() => handleHotelClick(hotel)}
              >
                {/* Hotel Image */}
                <div className="aspect-video bg-muted overflow-hidden">
                  {hotelImageUrl ? (
                    <AuthenticatedImage
                      src={hotelImageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const imgElement = e.target;
                        if (imgElement) {
                          imgElement.style.display = 'none';
                          const nextSibling = imgElement.nextSibling;
                          if (nextSibling) {
                            nextSibling.style.display = 'flex';
                          }
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                    style={{ display: hotelImageUrl ? 'none' : 'flex' }}
                  >
                    <Building2 className="h-12 w-12 text-primary/40" />
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{hotel.name}</CardTitle>
                  </div>
                  {(hotel.address || hotel.description) && (
                    <CardDescription className="mt-2 space-y-1">
                      {hotel.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {hotel.address}
                        </span>
                      )}
                      {hotel.description && (
                        <p className="line-clamp-2">{hotel.description}</p>
                      )}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-1.5">
                    {hotel.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{hotel.phoneNumber}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{hotel.email}</span>
                      </div>
                    )}
                    {hotel.starRating && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{hotel.starRating} Star{hotel.starRating !== 1 ? 's' : ''}</span>
                        {hotel.category && <span className="text-muted-foreground">· {hotel.category}</span>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );

  // Settings Form View
  const renderSettingsView = () => (
    <PageWrapper
      title={selectedHotel?.name ?? 'Hotel Settings'}
      description="Configure hotel information and amenities"
      icon={Settings}
      actions={
        <Button
          variant="outline"
          onClick={handleBackToHotels}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hotels
        </Button>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Basic Information</CardTitle>
                <CardDescription>Basic hotel information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hotel Name *</Label>
                <Input
                  id="hotelName"
                  name="hotelName"
                  value={settings.hotelName}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starRating" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Star Rating</Label>
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
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
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
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Location Information</CardTitle>
                <CardDescription>Hotel location details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address *</Label>
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
                <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={settings.city}
                  onChange={handleInputChange}
                  placeholder="City name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={settings.state}
                  onChange={handleInputChange}
                  placeholder="State or province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={settings.country}
                  onChange={handleInputChange}
                  placeholder="Country name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Postal Code</Label>
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
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
                <CardDescription>Hotel contact details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number *</Label>
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
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address *</Label>
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
              <Label htmlFor="website" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website</Label>
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
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Hotel Details</CardTitle>
                <CardDescription>Additional hotel information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInTime" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  name="checkInTime"
                  type="time"
                  value={settings.checkInTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutTime" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Check-out Time</Label>
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
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Wifi className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Amenities &amp; Services</CardTitle>
                <CardDescription>Select the amenities and services available at the hotel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors select-none ${
                      enabled
                        ? 'border-primary/50 bg-primary/[0.06] text-foreground'
                        : 'border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={`amenities.${amenity}`}
                      checked={enabled}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-xs font-medium">{amenityNames[amenity] || amenity}</span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="border-t border-border pt-6 flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isSubmitting ? 'Deleting...' : 'Delete Hotel'}
          </Button>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={handleBackToHotels}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Hotel'}
            </Button>
          </div>
        </div>

        {/* Submit Message */}
        {submitMessage.message && (
          <div className={`p-4 rounded-lg border text-sm ${
            submitMessage.type === 'success'
              ? 'bg-primary/5 text-foreground border-primary/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}>
            {submitMessage.message}
          </div>
        )}
      </form>
    </PageWrapper>
  );

  return (
    <>
      {currentView === 'hotels' && renderHotelsView()}
      {currentView === 'settings' && renderSettingsView()}
    </>
  );
};

export default HotelSettingsPage;
