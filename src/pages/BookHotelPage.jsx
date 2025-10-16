import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Plus, Calendar, Users, MapPin, Clock, Building2, Bed, Loader2, ArrowLeft, MoreHorizontal, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import { apiClient, api } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

const BookHotelPage = () => {
  // Main toggle states: 'create' | 'action'
  const [activeView, setActiveView] = useState('create');
  
  // View states: 'hotels' | 'rooms' | 'booking'
  const [currentView, setCurrentView] = useState('hotels');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Data states
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedHotelForBookings, setSelectedHotelForBookings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [error, setError] = useState(null);
  const [bookingsError, setBookingsError] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  
  // Booking form states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    // Booking Details
    checkInDate: '',
    checkOutDate: '',
    guestCount: 1,
    totalAmount: '',
    
    // Guest Information
    guests: [
      {
        cid: '',
        name: '',
        age: '',
        gender: '',
        countryOfOrigin: '',
        phoneNumber: '',
        email: ''
      }
    ]
  });

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  // Fetch bookings when action tab is clicked
  useEffect(() => {
    console.log('useEffect triggered - activeView:', activeView, 'hotels.length:', hotels.length);
    if (activeView === 'action' && hotels.length > 0) {
      // Use the first hotel if no hotel is selected, or use the selected hotel
      const hotelToUse = selectedHotelForBookings || hotels[0];
      console.log('Calling fetchBookings with hotel ID:', hotelToUse.id);
      setSelectedHotelForBookings(hotelToUse);
      fetchBookings(hotelToUse.id);
    }
  }, [activeView, hotels]);

  // Close action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (openActionMenu && !event.target.closest('.action-menu-container')) {
        setOpenActionMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu]);

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

  const fetchRooms = async (hotelId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      const response = await api.room.getRoomsByHotel(hotelId);
      const responseData = response.data || response;
      
      let roomsData = [];
      if (responseData.success && Array.isArray(responseData.data)) {
        roomsData = responseData.data;
      } else if (Array.isArray(responseData)) {
        roomsData = responseData;
      }
      
      setRooms(roomsData);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async (hotelId = null) => {
    try {
      console.log('fetchBookings called with hotelId:', hotelId);
      setIsLoadingBookings(true);
      setBookingsError(null);
      
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      // Use hotel-specific endpoint if hotelId is provided, otherwise use generic endpoint
      const endpoint = hotelId ? `/bookings/hotel/${hotelId}` : '/bookings';
      console.log('Making API call to:', endpoint);
      
      const response = await apiClient.get(endpoint);
      console.log('API response:', response);
      
      const responseData = response.data || response;
      
      let bookingsData = [];
      if (responseData.success && Array.isArray(responseData.data)) {
        bookingsData = responseData.data;
      } else if (Array.isArray(responseData)) {
        bookingsData = responseData;
      } else if (Array.isArray(responseData.bookings)) {
        bookingsData = responseData.bookings;
      }
      
      console.log('Processed bookings data:', bookingsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookingsError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
    setCurrentView('rooms');
    fetchRooms(hotel.id);
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setCurrentView('booking');
  };

  const handleBackToHotels = () => {
    setCurrentView('hotels');
    setSelectedHotel(null);
    setRooms([]);
  };

  const handleBackToRooms = () => {
    setCurrentView('rooms');
    setSelectedRoom(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleGuestChange = (guestIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((guest, index) => 
        index === guestIndex ? { ...guest, [field]: value } : guest
      )
    }));
    
    const errorKey = `guest_${guestIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Validate guest information
    formData.guests.forEach((guest, index) => {
      if (!guest.name) newErrors[`guest_${index}_name`] = 'Guest name is required';
      if (!guest.email) newErrors[`guest_${index}_email`] = 'Guest email is required';
      if (!guest.phoneNumber) newErrors[`guest_${index}_phoneNumber`] = 'Guest phone number is required';
      if (!guest.age || guest.age < 1) newErrors[`guest_${index}_age`] = 'Guest age is required';
      if (!guest.gender) newErrors[`guest_${index}_gender`] = 'Guest gender is required';
      if (!guest.countryOfOrigin) newErrors[`guest_${index}_countryOfOrigin`] = 'Guest country of origin is required';
    });
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (!formData.guestCount || formData.guestCount < 1) newErrors.guestCount = 'Guest count must be at least 1';
    
    // Comprehensive date validation
    if (formData.checkInDate) {
      const checkIn = new Date(formData.checkInDate);
      
      // Check-in date cannot be in the past
      if (checkIn < today) {
        newErrors.checkInDate = 'Check-in date cannot be in the past';
      }
      
      // Check-in date cannot be more than 1 year in the future
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (checkIn > oneYearFromNow) {
        newErrors.checkInDate = 'Check-in date cannot be more than 1 year in the future';
      }
    }
    
    if (formData.checkOutDate) {
      const checkOut = new Date(formData.checkOutDate);
      
      // Check-out date cannot be in the past
      if (checkOut < today) {
        newErrors.checkOutDate = 'Check-out date cannot be in the past';
      }
      
      // Check-out date cannot be more than 1 year in the future
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (checkOut > oneYearFromNow) {
        newErrors.checkOutDate = 'Check-out date cannot be more than 1 year in the future';
      }
    }
    
    // Validate check-in is before check-out
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkIn >= checkOut) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
      
      // Check-out must be at least 1 day after check-in
      const oneDayAfter = new Date(checkIn);
      oneDayAfter.setDate(oneDayAfter.getDate() + 1);
      if (checkOut < oneDayAfter) {
        newErrors.checkOutDate = 'Check-out date must be at least 1 day after check-in date';
      }
      
      // Maximum stay duration (30 days)
      const maxStayDuration = 30;
      const stayDuration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (stayDuration > maxStayDuration) {
        newErrors.checkOutDate = `Maximum stay duration is ${maxStayDuration} days`;
      }
    }
    
    // Validate guest count doesn't exceed room capacity
    if (selectedRoom && formData.guestCount > selectedRoom.maxOccupancy) {
      newErrors.guestCount = `Maximum occupancy for this room is ${selectedRoom.maxOccupancy}`;
    }
    
    // Validate total amount
    if (!formData.totalAmount || formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Total amount is required';
    } else if (formData.totalAmount < 0) {
      newErrors.totalAmount = 'Total amount cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      const bookingData = {
        hotelId: selectedHotel.id,
        roomId: selectedRoom.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: formData.guestCount,
        totalAmount: formData.totalAmount,
        guests: formData.guests.map(guest => ({
          cid: guest.cid,
          name: guest.name,
          age: parseInt(guest.age) || 0,
          gender: guest.gender,
          countryOfOrigin: guest.countryOfOrigin,
          phoneNumber: guest.phoneNumber,
          email: guest.email,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString()
        }))
      };
      
      // Show loading alert
      Swal.fire({
        title: 'Creating Booking...',
        text: 'Please wait while we process your booking.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await apiClient.post('/bookings', bookingData);
      
      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Booking Created Successfully!',
        text: `Your booking for ${selectedHotel?.name} - Room ${selectedRoom?.roomNumber} has been submitted.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });
      
      // Reset form and navigate back to hotels
      setCurrentView('hotels');
      setSelectedHotel(null);
      setSelectedRoom(null);
        setFormData({
          checkInDate: '',
          checkOutDate: '',
          guestCount: 1,
          totalAmount: '',
          guests: [
            {
              cid: '',
              name: '',
              age: '',
              gender: '',
              countryOfOrigin: '',
              phoneNumber: '',
              email: ''
            }
          ]
      });
      
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Show error alert
      let errorMessage = 'Failed to create booking. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Hotels List View
  const renderHotelsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">Select a hotel to manage bookings and reservations</p>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
                )}
              </div>
  );

  // Rooms List View
  const renderRoomsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Rooms - {selectedHotel?.name}</h1>
          <p className="text-muted-foreground">Select a room to create a booking</p>
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

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading rooms...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              <p className="font-medium">Error loading rooms</p>
              <p className="text-sm mt-1">{error}</p>
              <Button onClick={() => fetchRooms(selectedHotel.id)} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && rooms.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No rooms found</p>
              <p className="text-sm mt-1">No rooms are available for this hotel.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card 
              key={room.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleRoomClick(room)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <Bed className="h-5 w-5" />
                  Room {room.roomNumber}
                </CardTitle>
                <CardDescription>
                  {room.roomTypeName && (
                    <p className="font-medium">{room.roomTypeName}</p>
                  )}
                  {room.description && (
                    <p className="text-sm mt-1">{room.description}</p>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Price:</span>
                    <span className="text-lg font-bold text-green-600">
                      Nu {room.basePrice || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Max Occupancy:</span>
                    <span className="text-sm">{room.maxOccupancy || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Floor:</span>
                    <span className="text-sm">{room.floor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      room.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      room.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' :
                      room.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {room.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Booking Form View
  const renderBookingView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Create Booking</h1>
          <p className="text-muted-foreground">
            {selectedHotel?.name} - Room {selectedRoom?.roomNumber}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleBackToRooms}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room Summary */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="font-bold">Hotel</Label>
                <p className="text-sm font-medium">{selectedHotel?.name}</p>
              </div>
              <div>
                <Label className="font-bold">Room</Label>
                <p className="text-sm font-medium">Room {selectedRoom?.roomNumber}</p>
              </div>
              <div>
                <Label className="font-bold">Room Type</Label>
                <p className="text-sm font-medium">{selectedRoom?.roomTypeName || 'N/A'}</p>
              </div>
              <div>
                <Label className="font-bold">Base Price</Label>
                <p className="text-sm font-medium text-green-600">Nu {selectedRoom?.basePrice || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex text-md items-center gap-2">
              Booking Details
            </CardTitle>
            <CardDescription>
              Stay dates and guest information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">Check-in Date *</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                {errors.checkInDate && (
                  <p className="text-sm text-destructive">{errors.checkInDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Check-out Date *</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                  min={formData.checkInDate ? new Date(new Date(formData.checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                {errors.checkOutDate && (
                  <p className="text-sm text-destructive">{errors.checkOutDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestCount">Guest Count *</Label>
                <Input
                  id="guestCount"
                  type="number"
                  min="1"
                  max={selectedRoom?.maxOccupancy || 10}
                  value={formData.guestCount}
                  onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value))}
                />
                {errors.guestCount && (
                  <p className="text-sm text-destructive">{errors.guestCount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (Nu) *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.totalAmount || ''}
                  onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || '')}
                  placeholder="Enter amount"
                />
                {errors.totalAmount && (
                  <p className="text-sm text-destructive">{errors.totalAmount}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              Guest Information
            </CardTitle>
            <CardDescription>
              Primary guest details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.guests.map((guest, index) => (
              <div key={index} className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Guest {index + 1}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`guest_${index}_name`}>Full Name *</Label>
                    <Input
                      id={`guest_${index}_name`}
                      value={guest.name}
                      onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                      placeholder="Full name"
                    />
                    {errors[`guest_${index}_name`] && (
                      <p className="text-sm text-destructive">{errors[`guest_${index}_name`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`guest_${index}_email`}>Email *</Label>
                    <Input
                      id={`guest_${index}_email`}
                      type="email"
                      value={guest.email}
                      onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                      placeholder="email@example.com"
                    />
                    {errors[`guest_${index}_email`] && (
                      <p className="text-sm text-destructive">{errors[`guest_${index}_email`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`guest_${index}_phoneNumber`}>Phone Number *</Label>
                    <Input
                      id={`guest_${index}_phoneNumber`}
                      value={guest.phoneNumber}
                      onChange={(e) => handleGuestChange(index, 'phoneNumber', e.target.value)}
                      placeholder="+975 12345678"
                    />
                    {errors[`guest_${index}_phoneNumber`] && (
                      <p className="text-sm text-destructive">{errors[`guest_${index}_phoneNumber`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`guest_${index}_age`}>Age *</Label>
                    <Input
                      id={`guest_${index}_age`}
                      type="number"
                      min="1"
                      max="120"
                      value={guest.age}
                      onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                      placeholder="Age"
                    />
                    {errors[`guest_${index}_age`] && (
                      <p className="text-sm text-destructive">{errors[`guest_${index}_age`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`guest_${index}_gender`}>Gender *</Label>
                    <Select
                      value={guest.gender}
                      onChange={(e) => handleGuestChange(index, 'gender', e.target.value)}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                    {errors[`guest_${index}_gender`] && (
                      <p className="text-sm text-destructive">{errors[`guest_${index}_gender`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`guest_${index}_countryOfOrigin`}>Country of Origin *</Label>
                    <Input
                      id={`guest_${index}_countryOfOrigin`}
                      value={guest.countryOfOrigin}
                      onChange={(e) => handleGuestChange(index, 'countryOfOrigin', e.target.value)}
                      placeholder="Country"
                    />
                    {errors[`guest_${index}_countryOfOrigin`] && (
                      <p className="text-sm text-destructive">{errors[`guest_${index}_countryOfOrigin`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`guest_${index}_cid`}>CID (Optional)</Label>
                    <Input
                      id={`guest_${index}_cid`}
                      value={guest.cid}
                      onChange={(e) => handleGuestChange(index, 'cid', e.target.value)}
                      placeholder="Citizen ID"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>


        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleBackToRooms}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="container mx-auto p-0 md:p-6">
      {/* Toggle Buttons */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={activeView === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveView('create')}
            className="flex-1"
          >
            Create Booking
          </Button>
          <Button
            variant={activeView === 'action' ? 'default' : 'outline'}
            onClick={() => setActiveView('action')}
            className="flex-1"
          >
            Booking Action
          </Button>
        </div>
      </div>

      {/* Create Booking View */}
      {activeView === 'create' && (
        <>
          {currentView === 'hotels' && renderHotelsView()}
          {currentView === 'rooms' && renderRoomsView()}
          {currentView === 'booking' && renderBookingView()}
        </>
      )}

      {/* Booking Action View */}
      {activeView === 'action' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Booking Management</h1>
              <p className="text-muted-foreground">Manage hotel bookings and reservations</p>
            </div>
          </div>

          {/* Hotel Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Select Hotel</CardTitle>
              <CardDescription>Choose a hotel to view its bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hotel-selector">Hotel</Label>
                  <Select
                    value={selectedHotelForBookings?.id || ''}
                    onChange={(e) => {
                      const hotelId = e.target.value;
                      console.log('Hotel selected:', hotelId);
                      const hotel = hotels.find(h => h.id.toString() === hotelId);
                      console.log('Found hotel:', hotel);
                      if (hotel) {
                        setSelectedHotelForBookings(hotel);
                        fetchBookings(hotel.id);
                      }
                    }}
                  >
                    <option value="">Select a hotel</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </Select>
                </div>
                
                {/* Selected Hotel Display */}
                {selectedHotelForBookings && (
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold text-primary">
                      {selectedHotelForBookings.name}
                    </h3>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoadingBookings && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading bookings...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {bookingsError && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading bookings</p>
                  <p className="text-sm mt-1">{bookingsError}</p>
                  <Button 
                    onClick={() => selectedHotelForBookings && fetchBookings(selectedHotelForBookings.id)} 
                    className="mt-4"
                    disabled={!selectedHotelForBookings}
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookings Table */}
          {!isLoadingBookings && !bookingsError && bookings.length > 0 && selectedHotelForBookings && (
            <Card>
              <CardHeader>
                <CardTitle>Total Bookings</CardTitle>
                <CardDescription>Manage hotel bookings and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Reference</th>
                        <th className="text-left p-3 font-medium">Room</th>
                        <th className="text-left p-3 font-medium">Guest Name</th>
                        <th className="text-left p-3 font-medium">CID</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{booking.bookingReference}</td>
                          <td className="p-3">Room {booking.roomNumber}</td>
                          <td className="p-3">{booking.guestName || 'N/A'}</td>
                          <td className="p-3">{booking.cid || 'N/A'}</td>
                          <td className="p-3">
                            <Badge 
                              variant={
                                booking.status === 'CONFIRMED' ? 'default' :
                                booking.status === 'PENDING' ? 'secondary' :
                                booking.status === 'CANCELLED' ? 'destructive' :
                                booking.status === 'CHECKED_IN' ? 'default' :
                                booking.status === 'CHECKED_OUT' ? 'outline' :
                                'secondary'
                              }
                            >
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="relative action-menu-container">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setOpenActionMenu(openActionMenu === booking.id ? null : booking.id)}
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                              
                              {openActionMenu === booking.id && (
                                <div className="absolute right-0 top-8 z-50 w-48 bg-popover border border-border rounded-lg shadow-lg">
                                  <div className="p-1">
                                    <button 
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent rounded-md transition-colors"
                                      onClick={async () => {
                                        setOpenActionMenu(null);
                                        try {
                                          const response = await apiClient.put(`/bookings/${booking.id}/confirm`);
                                          if (response.success) {
                                            // Refresh bookings after successful action
                                            if (selectedHotelForBookings) {
                                              fetchBookings(selectedHotelForBookings.id);
                                            }
                                            console.log('Booking confirmed successfully');
                                          }
                                        } catch (error) {
                                          console.error('Error confirming booking:', error);
                                        }
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Confirm
                                    </button>
                                    <button 
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent rounded-md transition-colors"
                                      onClick={async () => {
                                        setOpenActionMenu(null);
                                        try {
                                          const response = await apiClient.put(`/bookings/${booking.id}/checkin`);
                                          if (response.success) {
                                            // Refresh bookings after successful action
                                            if (selectedHotelForBookings) {
                                              fetchBookings(selectedHotelForBookings.id);
                                            }
                                            console.log('Booking checked-in successfully');
                                          }
                                        } catch (error) {
                                          console.error('Error checking-in booking:', error);
                                        }
                                      }}
                                    >
                                      <LogIn className="h-4 w-4" />
                                      Check-in
                                    </button>
                                    <button 
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent rounded-md transition-colors"
                                      onClick={async () => {
                                        setOpenActionMenu(null);
                                        try {
                                          const response = await apiClient.put(`/bookings/${booking.id}/checkout`);
                                          if (response.success) {
                                            // Refresh bookings after successful action
                                            if (selectedHotelForBookings) {
                                              fetchBookings(selectedHotelForBookings.id);
                                            }
                                            console.log('Booking checked-out successfully');
                                          }
                                        } catch (error) {
                                          console.error('Error checking-out booking:', error);
                                        }
                                      }}
                                    >
                                      <LogOut className="h-4 w-4" />
                                      Check-out
                                    </button>
                                    <button 
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors"
                                      onClick={async () => {
                                        setOpenActionMenu(null);
                                        try {
                                          const response = await apiClient.put(`/bookings/${booking.id}/cancel`);
                                          if (response.success) {
                                            // Refresh bookings after successful action
                                            if (selectedHotelForBookings) {
                                              fetchBookings(selectedHotelForBookings.id);
                                            }
                                            console.log('Booking cancelled successfully');
                                          }
                                        } catch (error) {
                                          console.error('Error cancelling booking:', error);
                                        }
                                      }}
                                    >
                                      <XCircle className="h-4 w-4" />
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Bookings State */}
          {!isLoadingBookings && !bookingsError && bookings.length === 0 && selectedHotelForBookings && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No bookings found</p>
                  <p className="text-sm mt-1">No bookings are currently available for {selectedHotelForBookings.name}.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Hotel Selected State */}
          {!isLoadingBookings && !bookingsError && !selectedHotelForBookings && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Select a Hotel</p>
                  <p className="text-sm mt-1">Please select a hotel from the dropdown above to view its bookings.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default BookHotelPage;
