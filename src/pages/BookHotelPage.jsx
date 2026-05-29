import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  Calendar,
  Building2,
  Bed,
  ArrowLeft,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  RefreshCw,
  Phone,
  Mail,
  Search,
  Users,
  Banknote,
  User,
} from 'lucide-react';
import { apiClient, api } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import { getHotelPrimaryImage } from '@/lib/utils';
import AuthenticatedImage from '@/components/AuthenticatedImage';
import Swal from 'sweetalert2';

const createEmptyGuest = () => ({
  cid: '',
  name: '',
  age: '',
  gender: '',
  countryOfOrigin: '',
  phoneNumber: '',
  email: '',
});

const BOOKING_STATUS_STYLES = {
  CONFIRMED: 'bg-primary/10 text-primary border-primary/20',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  CHECKED_IN: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
  CHECKED_OUT: 'bg-muted text-muted-foreground border-border',
};

function formatBookingDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return value;
  }
}

function getStayNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : null;
}

function calculateStayTotal(checkIn, checkOut, basePrice) {
  const nights = getStayNights(checkIn, checkOut);
  const price = Number(basePrice);
  if (nights == null || !Number.isFinite(price) || price <= 0) return '';
  return Math.round(nights * price * 100) / 100;
}

function BookingStatusBadge({ status }) {
  const style = BOOKING_STATUS_STYLES[status] || 'bg-muted text-muted-foreground border-border';
  const label = status ? status.replace(/_/g, ' ') : '—';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${style}`}>
      {label}
    </span>
  );
}

const syncGuestsToCount = (guests, count) => {
  const safeCount = Math.max(1, count || 1);
  if (guests.length === safeCount) return guests;
  if (guests.length < safeCount) {
    return [
      ...guests,
      ...Array.from({ length: safeCount - guests.length }, () => createEmptyGuest()),
    ];
  }
  return guests.slice(0, safeCount);
};

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
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0, left: 'auto' });
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
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
    
    // Guest Information (length synced with guestCount)
    guests: [createEmptyGuest()],
  });

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (activeView === 'action' && hotels.length > 0) {
      const hotelToUse = selectedHotelForBookings || hotels[0];
      setSelectedHotelForBookings(hotelToUse);
      fetchBookings(hotelToUse.id);
    }
  }, [activeView, hotels]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    const query = bookingSearch.trim().toLowerCase();
    if (query) {
      result = result.filter((b) =>
        b.bookingReference?.toLowerCase().includes(query)
        || b.guestName?.toLowerCase().includes(query)
        || b.cid?.toLowerCase().includes(query)
        || String(b.roomNumber ?? '').includes(query)
        || String(b.id ?? '').includes(query),
      );
    }
    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }
    return result;
  }, [bookings, bookingSearch, statusFilter]);

  const bookingStatusOptions = useMemo(() => {
    const statuses = new Set(bookings.map((b) => b.status).filter(Boolean));
    return Array.from(statuses).sort();
  }, [bookings]);

  const runBookingAction = useCallback(async (bookingId, endpoint, successTitle, successText) => {
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const res = await apiClient.put(`/bookings/${bookingId}/${endpoint}`);
      if (res.success && selectedHotelForBookings) {
        fetchBookings(selectedHotelForBookings.id);
        Swal.fire({
          icon: 'success',
          title: successTitle,
          text: successText,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Action failed', text: 'Please try again.' });
    }
  }, [selectedHotelForBookings]);

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
    setFormData((prev) => {
      const totalAmount = calculateStayTotal(prev.checkInDate, prev.checkOutDate, room.basePrice);
      return totalAmount !== '' ? { ...prev, totalAmount } : prev;
    });
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
    if (field === 'guestCount') {
      const maxOccupancy = selectedRoom?.maxOccupancy || 10;
      const parsed = parseInt(value, 10);
      const count = Number.isNaN(parsed)
        ? 1
        : Math.min(Math.max(1, parsed), maxOccupancy);

      setFormData((prev) => ({
        ...prev,
        guestCount: count,
        guests: syncGuestsToCount(prev.guests, count),
      }));

      setErrors((prev) => {
        const next = { ...prev, guestCount: '' };
        Object.keys(next).forEach((key) => {
          const match = key.match(/^guest_(\d+)_/);
          if (match && parseInt(match[1], 10) >= count) {
            delete next[key];
          }
        });
        return next;
      });
      return;
    }

    if (field === 'checkInDate' || field === 'checkOutDate') {
      setFormData((prev) => {
        const checkIn = field === 'checkInDate' ? value : prev.checkInDate;
        const checkOut = field === 'checkOutDate' ? value : prev.checkOutDate;
        const totalAmount = calculateStayTotal(checkIn, checkOut, selectedRoom?.basePrice);
        return {
          ...prev,
          [field]: value,
          ...(totalAmount !== '' ? { totalAmount } : {}),
        };
      });
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
      if (errors.totalAmount) {
        setErrors((prev) => ({ ...prev, totalAmount: '' }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
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
      if (!guest.phoneNumber) newErrors[`guest_${index}_phoneNumber`] = 'Guest phone number is required';
      if (!guest.age || guest.age < 1) newErrors[`guest_${index}_age`] = 'Guest age is required';
      if (!guest.gender) newErrors[`guest_${index}_gender`] = 'Guest gender is required';
      if (!guest.countryOfOrigin) newErrors[`guest_${index}_countryOfOrigin`] = 'Guest country of origin is required';
    });
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (!formData.guestCount || formData.guestCount < 1) {
      newErrors.guestCount = 'Guest count must be at least 1';
    } else if (formData.guests.length !== formData.guestCount) {
      newErrors.guestCount = 'Guest count must match the number of guest forms filled';
    }
    
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
          guests: [createEmptyGuest()],
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
    <div className="space-y-4">
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading hotels…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error} <Button variant="ghost" size="sm" onClick={fetchHotels} className="ml-2 h-6 text-xs">Retry</Button>
        </div>
      )}

      {!isLoading && !error && hotels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Building2 className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No hotels found</p>
          <p className="text-xs mt-1">No hotels are currently registered in the system.</p>
        </div>
      )}

      {!isLoading && !error && hotels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((hotel) => {
            const hotelImageUrl = getHotelPrimaryImage(hotel.images);
            return (
              <Card
                key={hotel.id}
                className="cursor-pointer hover:border-primary/30 transition-colors overflow-hidden"
                onClick={() => handleHotelClick(hotel)}
              >
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
                          if (nextSibling) nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                    style={{ display: hotelImageUrl ? 'none' : 'flex' }}
                  >
                    <Building2 className="h-10 w-10 text-primary/40" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{hotel.name}</CardTitle>
                  {hotel.description && (
                    <CardDescription className="line-clamp-2">{hotel.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-1.5">
                  {hotel.phoneNumber && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{hotel.phoneNumber}</span>
                    </div>
                  )}
                  {hotel.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{hotel.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // Rooms List View
  const renderRoomsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{selectedHotel?.name}</p>
          <p className="text-xs text-muted-foreground">Select an available room to create a booking</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleBackToHotels} className="gap-1.5 text-xs h-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Hotels
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading rooms…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error} <Button variant="ghost" size="sm" onClick={() => fetchRooms(selectedHotel.id)} className="ml-2 h-6 text-xs">Retry</Button>
        </div>
      )}

      {!isLoading && !error && rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bed className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No rooms available</p>
          <p className="text-xs mt-1">No rooms are configured for this hotel.</p>
        </div>
      )}

      {!isLoading && !error && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const isOccupied = room.status === 'OCCUPIED';
            const statusConfig = {
              AVAILABLE: 'bg-primary/10 text-primary',
              OCCUPIED: 'bg-destructive/10 text-destructive',
              MAINTENANCE: 'bg-amber-50 text-amber-700',
            };
            return (
              <Card
                key={room.id}
                className={`relative transition-colors ${
                  isOccupied
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer hover:border-primary/30'
                }`}
                onClick={() => !isOccupied && handleRoomClick(room)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Room {room.roomNumber}</CardTitle>
                        {room.roomTypeName && (
                          <p className="text-xs text-muted-foreground">{room.roomTypeName}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${statusConfig[room.status] || 'bg-muted text-muted-foreground'}`}>
                      {room.status || 'N/A'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <div className="grid grid-cols-2 gap-px bg-border">
                      <div className="bg-background px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price</p>
                        <p className="text-sm font-semibold text-primary mt-0.5">Nu {room.basePrice || '—'}</p>
                      </div>
                      <div className="bg-background px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Max Guests</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{room.maxOccupancy || '—'}</p>
                      </div>
                      {room.floor && (
                        <div className="bg-background px-3 py-2 col-span-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Floor</p>
                          <p className="text-sm text-foreground mt-0.5">{room.floor}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {room.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{room.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // Booking Form View
  const stayNights = getStayNights(formData.checkInDate, formData.checkOutDate);
  const roomBasePrice = Number(selectedRoom?.basePrice);

  const renderBookingView = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">New Booking</p>
          <p className="text-xs text-muted-foreground">{selectedHotel?.name} · Room {selectedRoom?.roomNumber}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleBackToRooms} className="gap-1.5 text-xs h-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Rooms
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Room Summary */}
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: 'Hotel', value: selectedHotel?.name },
                { label: 'Room', value: `Room ${selectedRoom?.roomNumber}` },
                { label: 'Type', value: selectedRoom?.roomTypeName || '—' },
                { label: 'Base Price', value: `Nu ${selectedRoom?.basePrice || '—'}`, highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="bg-background px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className={`text-sm font-medium mt-0.5 ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Booking Details</CardTitle>
                <CardDescription>Stay dates and guest count</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="checkInDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Check-in Date <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className={errors.checkInDate ? 'border-destructive' : ''}
                />
                {errors.checkInDate && <p className="text-xs text-destructive">{errors.checkInDate}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="checkOutDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Check-out Date <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                  min={formData.checkInDate ? new Date(new Date(formData.checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className={errors.checkOutDate ? 'border-destructive' : ''}
                />
                {errors.checkOutDate && <p className="text-xs text-destructive">{errors.checkOutDate}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guestCount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Guest Count <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="guestCount"
                  type="number"
                  min="1"
                  max={selectedRoom?.maxOccupancy || 10}
                  value={formData.guestCount}
                  onChange={(e) => handleInputChange('guestCount', e.target.value)}
                  className={errors.guestCount ? 'border-destructive' : ''}
                />
                {errors.guestCount && <p className="text-xs text-destructive">{errors.guestCount}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="totalAmount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Amount (Nu) <span className="text-destructive normal-case tracking-normal font-normal">*</span>
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.totalAmount || ''}
                  onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || '')}
                  placeholder={roomBasePrice > 0 ? 'Calculated from dates × base price' : 'Enter amount'}
                  className={errors.totalAmount ? 'border-destructive' : ''}
                />
                {stayNights != null && roomBasePrice > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nu {roomBasePrice.toLocaleString()} × {stayNights} night{stayNights === 1 ? '' : 's'} = Nu{' '}
                    <span className="font-medium text-foreground">
                      {calculateStayTotal(formData.checkInDate, formData.checkOutDate, roomBasePrice).toLocaleString()}
                    </span>
                  </p>
                )}
                {errors.totalAmount && <p className="text-xs text-destructive">{errors.totalAmount}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Guest Information</CardTitle>
                <CardDescription>
                  {formData.guestCount === 1
                    ? 'Primary guest details'
                    : `Details for all ${formData.guestCount} guests`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.guests.map((guest, index) => (
              <div key={index} className="rounded-xl border border-border/60 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guest {index + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`guest_${index}_name`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
                    <Input id={`guest_${index}_name`} value={guest.name} onChange={(e) => handleGuestChange(index, 'name', e.target.value)} placeholder="Full name" className={errors[`guest_${index}_name`] ? 'border-destructive' : ''} />
                    {errors[`guest_${index}_name`] && <p className="text-xs text-destructive">{errors[`guest_${index}_name`]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`guest_${index}_email`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email (Optional)</Label>
                    <Input id={`guest_${index}_email`} type="email" value={guest.email} onChange={(e) => handleGuestChange(index, 'email', e.target.value)} placeholder="email@example.com" className={errors[`guest_${index}_email`] ? 'border-destructive' : ''} />
                    {errors[`guest_${index}_email`] && <p className="text-xs text-destructive">{errors[`guest_${index}_email`]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`guest_${index}_phoneNumber`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number *</Label>
                    <Input id={`guest_${index}_phoneNumber`} value={guest.phoneNumber} onChange={(e) => handleGuestChange(index, 'phoneNumber', e.target.value)} placeholder="+975 12345678" className={errors[`guest_${index}_phoneNumber`] ? 'border-destructive' : ''} />
                    {errors[`guest_${index}_phoneNumber`] && <p className="text-xs text-destructive">{errors[`guest_${index}_phoneNumber`]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`guest_${index}_age`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age *</Label>
                    <Input id={`guest_${index}_age`} type="number" min="1" max="120" value={guest.age} onChange={(e) => handleGuestChange(index, 'age', e.target.value)} placeholder="Age" className={errors[`guest_${index}_age`] ? 'border-destructive' : ''} />
                    {errors[`guest_${index}_age`] && <p className="text-xs text-destructive">{errors[`guest_${index}_age`]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`guest_${index}_gender`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender *</Label>
                    <Select value={guest.gender} onChange={(e) => handleGuestChange(index, 'gender', e.target.value)} className={errors[`guest_${index}_gender`] ? 'border-destructive' : ''}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                    {errors[`guest_${index}_gender`] && <p className="text-xs text-destructive">{errors[`guest_${index}_gender`]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`guest_${index}_countryOfOrigin`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country of Origin *</Label>
                    <Input id={`guest_${index}_countryOfOrigin`} value={guest.countryOfOrigin} onChange={(e) => handleGuestChange(index, 'countryOfOrigin', e.target.value)} placeholder="Country" className={errors[`guest_${index}_countryOfOrigin`] ? 'border-destructive' : ''} />
                    {errors[`guest_${index}_countryOfOrigin`] && <p className="text-xs text-destructive">{errors[`guest_${index}_countryOfOrigin`]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`guest_${index}_cid`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CID (Optional)</Label>
                    <Input id={`guest_${index}_cid`} value={guest.cid} onChange={(e) => handleGuestChange(index, 'cid', e.target.value)} placeholder="Citizen ID" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={handleBackToRooms}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? 'Creating…' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border mb-6">
        {['create', 'action'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
              activeView === view
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {view === 'create' ? 'Create Booking' : 'Booking Action'}
          </button>
        ))}
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
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="space-y-1.5 min-w-[200px] flex-1">
                  <Label htmlFor="hotel-selector" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hotel
                  </Label>
                  <Select
                    id="hotel-selector"
                    value={selectedHotelForBookings?.id || ''}
                    onChange={(e) => {
                      const hotelId = e.target.value;
                      const hotel = hotels.find((h) => h.id.toString() === hotelId);
                      if (hotel) {
                        setSelectedHotelForBookings(hotel);
                        setBookingSearch('');
                        setStatusFilter('');
                        fetchBookings(hotel.id);
                      }
                    }}
                  >
                    <option value="">Select a hotel</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5 min-w-[200px] flex-1">
                  <Label htmlFor="booking-search" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                    <Input
                      id="booking-search"
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      placeholder="Reference, guest, room…"
                      className="h-9 pl-9"
                      disabled={!selectedHotelForBookings}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 min-w-[140px]">
                  <Label htmlFor="status-filter" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </Label>
                  <Select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    disabled={!selectedHotelForBookings}
                  >
                    <option value="">All statuses</option>
                    {bookingStatusOptions.map((status) => (
                      <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => selectedHotelForBookings && fetchBookings(selectedHotelForBookings.id)}
                  disabled={!selectedHotelForBookings || isLoadingBookings}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingBookings ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {bookingsError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm flex flex-wrap items-center gap-2">
              <span>{bookingsError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedHotelForBookings && fetchBookings(selectedHotelForBookings.id)}
                disabled={!selectedHotelForBookings}
                className="h-7 text-xs"
              >
                Retry
              </Button>
            </div>
          )}

          {!selectedHotelForBookings && !isLoadingBookings && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground rounded-xl border border-dashed border-border">
              <Building2 className="h-10 w-10 mb-3 opacity-30" aria-hidden />
              <p className="text-sm font-medium">Select a hotel</p>
              <p className="text-xs mt-1">Choose a hotel to view its booking records.</p>
            </div>
          )}

          {selectedHotelForBookings && (
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedHotelForBookings.name}
                    <span className="ml-2 font-normal text-muted-foreground">
                      ({filteredBookings.length}{bookingSearch || statusFilter ? ` of ${bookings.length}` : ''} bookings)
                    </span>
                  </p>
                </div>
              </div>

              {isLoadingBookings ? (
                <div className="p-4 space-y-2" aria-busy="true" aria-label="Loading bookings">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Calendar className="h-10 w-10 mb-3 opacity-30" aria-hidden />
                  <p className="text-sm font-medium">No bookings yet</p>
                  <p className="text-xs mt-1 max-w-xs">No reservations recorded for this hotel.</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Search className="h-10 w-10 mb-3 opacity-30" aria-hidden />
                  <p className="text-sm font-medium">No matching bookings</p>
                  <p className="text-xs mt-1">Try adjusting your search or status filter.</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2"
                    onClick={() => { setBookingSearch(''); setStatusFilter(''); }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div
                    className="hidden lg:grid lg:grid-cols-[minmax(120px,1.1fr)_minmax(140px,1.3fr)_72px_minmax(130px,1fr)_48px_52px_80px_96px_minmax(100px,auto)] items-center gap-3 px-4 py-2.5 bg-muted/40 border-b border-border min-w-[960px]"
                    role="row"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reference</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Guest</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Room</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Stay</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Nights</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Guests</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Amount</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Status</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Actions</span>
                  </div>

                  <div className="divide-y divide-border min-w-0 lg:min-w-[960px]">
                    {filteredBookings.map((booking) => {
                      const nights = getStayNights(booking.checkInDate, booking.checkOutDate);
                      return (
                        <div
                          key={booking.id}
                          className="flex flex-col gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors duration-150 lg:grid lg:grid-cols-[minmax(120px,1.1fr)_minmax(140px,1.3fr)_72px_minmax(130px,1fr)_48px_52px_80px_96px_minmax(100px,auto)] lg:items-center lg:gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Reference</p>
                            <p className="font-mono text-xs font-semibold text-foreground truncate">{booking.bookingReference ?? '—'}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">ID {booking.id}</p>
                          </div>

                          <div className="min-w-0 flex items-start gap-2">
                            <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <User className="h-4 w-4 text-primary" aria-hidden />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Guest</p>
                              <p className="text-sm font-medium text-foreground truncate">{booking.guestName || '—'}</p>
                              <p className="text-xs text-muted-foreground truncate">{booking.cid || 'No CID'}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Room</p>
                            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {booking.roomNumber != null ? `Room ${booking.roomNumber}` : '—'}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden mb-1">Stay</p>
                            <p><span className="font-medium text-foreground">In</span> {formatBookingDate(booking.checkInDate)}</p>
                            <p className="mt-0.5"><span className="font-medium text-foreground">Out</span> {formatBookingDate(booking.checkOutDate)}</p>
                          </div>

                          <div className="lg:text-center text-sm text-foreground tabular-nums">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Nights</p>
                            {nights ?? '—'}
                          </div>

                          <div className="lg:text-center text-sm text-foreground tabular-nums">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Guests</p>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-muted-foreground lg:hidden" aria-hidden />
                              {booking.guestCount ?? '—'}
                            </span>
                          </div>

                          <div className="lg:text-right text-sm font-medium text-foreground tabular-nums">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Amount</p>
                            <span className="inline-flex items-center gap-1 lg:justify-end">
                              <Banknote className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                              {booking.totalAmount != null ? `Nu ${Number(booking.totalAmount).toLocaleString()}` : '—'}
                            </span>
                          </div>

                          <div className="lg:flex lg:justify-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden mb-1">Status</p>
                            <BookingStatusBadge status={booking.status} />
                          </div>

                          <div className="lg:flex lg:justify-end">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden mb-1.5">Actions</p>
                            <div className="relative inline-block text-left action-menu-container">
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Actions for booking ${booking.bookingReference}`}
                                aria-expanded={openActionMenu === booking.id}
                                className="h-8 gap-1.5 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (openActionMenu === booking.id) {
                                    setOpenActionMenu(null);
                                  } else {
                                    const buttonRect = e.currentTarget.getBoundingClientRect();
                                    const menuWidth = 192;
                                    const menuHeight = 220;
                                    const viewportWidth = window.innerWidth;
                                    const viewportHeight = window.innerHeight;
                                    let top = buttonRect.bottom + 4;
                                    let right = viewportWidth - buttonRect.right;
                                    let left = 'auto';
                                    if (buttonRect.bottom + menuHeight + 4 > viewportHeight) top = buttonRect.top - menuHeight - 4;
                                    if (right < menuWidth && buttonRect.left > menuWidth) {
                                      right = 'auto';
                                      left = buttonRect.left - menuWidth - 4;
                                    }
                                    setMenuPosition({ top, right, left });
                                    setOpenActionMenu(booking.id);
                                  }
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                Manage
                              </Button>

                              {openActionMenu === booking.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-[50] bg-black/20"
                                    aria-hidden
                                    onClick={() => setOpenActionMenu(null)}
                                  />
                                  <div
                                    className="fixed z-[51] w-48 rounded-lg shadow-lg bg-background border border-border divide-y divide-border"
                                    role="menu"
                                    style={{
                                      top: `${menuPosition.top}px`,
                                      right: menuPosition.right === 'auto' ? 'auto' : `${menuPosition.right}px`,
                                      left: menuPosition.left === 'auto' ? 'auto' : `${menuPosition.left}px`,
                                    }}
                                  >
                                    <div className="py-1">
                                      {[
                                        { label: 'Confirm Booking', icon: CheckCircle, endpoint: 'confirm', successMsg: 'Booking has been confirmed' },
                                        { label: 'Check In', icon: LogIn, endpoint: 'checkin', successMsg: 'Guest has been checked in' },
                                        { label: 'Check Out', icon: LogOut, endpoint: 'checkout', successMsg: 'Guest has been checked out' },
                                      ].map(({ label, icon: Icon, endpoint, successMsg }) => (
                                        <button
                                          key={endpoint}
                                          type="button"
                                          role="menuitem"
                                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenActionMenu(null);
                                            runBookingAction(booking.id, endpoint, label, successMsg);
                                          }}
                                        >
                                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                                          {label}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="py-1">
                                      <button
                                        type="button"
                                        role="menuitem"
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenActionMenu(null);
                                          runBookingAction(booking.id, 'cancel', 'Cancelled', 'Booking has been cancelled');
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 shrink-0" aria-hidden />
                                        Cancel Booking
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookHotelPage;

