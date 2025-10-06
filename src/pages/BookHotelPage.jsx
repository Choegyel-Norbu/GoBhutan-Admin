import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Plus, Calendar, Users, MapPin, Clock, Building2, Bed, Loader2, ArrowLeft } from 'lucide-react';
import { apiClient, api } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

const BookHotelPage = () => {
  // View states: 'hotels' | 'rooms' | 'booking'
  const [currentView, setCurrentView] = useState('hotels');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Data states
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Booking form states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    
    // Booking Details
    checkInDate: '',
    checkOutDate: '',
    guestCount: 1,
    totalAmount: ''
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

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (!formData.customerName) newErrors.customerName = 'Customer name is required';
    if (!formData.customerEmail) newErrors.customerEmail = 'Email is required';
    if (!formData.customerPhone) newErrors.customerPhone = 'Phone number is required';
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
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: formData.guestCount,
        totalAmount: formData.totalAmount
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
        text: `Your booking for ${selectedHotel?.name} - Room ${selectedRoom?.roomNumber} has been confirmed.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });
      
      // Reset form and navigate back to hotels
      setCurrentView('hotels');
      setSelectedHotel(null);
      setSelectedRoom(null);
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          checkInDate: '',
          checkOutDate: '',
          guestCount: 1,
          totalAmount: ''
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

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              Customer Information
            </CardTitle>
            <CardDescription>
              Primary customer details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Full name"
                />
                {errors.customerName && (
                  <p className="text-sm text-destructive">{errors.customerName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="email@example.com"
                />
                {errors.customerEmail && (
                  <p className="text-sm text-destructive">{errors.customerEmail}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customerPhone">Phone *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+975 12345678"
                />
                {errors.customerPhone && (
                  <p className="text-sm text-destructive">{errors.customerPhone}</p>
                )}
              </div>
            </div>
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
      {currentView === 'hotels' && renderHotelsView()}
      {currentView === 'rooms' && renderRoomsView()}
      {currentView === 'booking' && renderBookingView()}
    </div>
  );
};

export default BookHotelPage;
