import { useState, useEffect, useRef } from 'react';
import {
  Film, Calendar, X, MapPin, Building, RefreshCw, Plus,
  Clapperboard, DoorOpen,
  Trash2, Settings, Monitor, Armchair, Ticket, Clock,
  AlertCircle, Pencil, ChevronRight, Lock, CheckCircle2
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

// Utility for conditional classes
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Max seats allowed per hall when configuring (aligned with API /api/seats/hall/:id)
const MAX_SEATS_PER_HALL = 50;

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-muted/50 ${className}`} />;
}

function AddMoviePage() {
  const { user } = useAuth();

  // ==================== STATE MANAGEMENT ====================

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theaters state
  const [expandedLocationId, setExpandedLocationId] = useState(null);
  const [theaters, setTheaters] = useState({});
  const [loadingTheaters, setLoadingTheaters] = useState({});
  const [theatersError, setTheatersError] = useState({});

  // Theater form state
  const [showTheaterForm, setShowTheaterForm] = useState({});
  const [theaterFormData, setTheaterFormData] = useState({});
  const [theaterErrors, setTheaterErrors] = useState({});
  const [isSubmittingTheater, setIsSubmittingTheater] = useState({});

  // Halls state
  const [expandedTheaterId, setExpandedTheaterId] = useState(null);
  const [halls, setHalls] = useState({});
  const [loadingHalls, setLoadingHalls] = useState({});
  const [hallsError, setHallsError] = useState({});

  // Hall form state
  const [showHallForm, setShowHallForm] = useState({});
  const [hallFormData, setHallFormData] = useState({});
  const [hallErrors, setHallErrors] = useState({});
  const [isSubmittingHall, setIsSubmittingHall] = useState({});

  // Seats state
  const [expandedHallId, setExpandedHallId] = useState(null);
  const [seats, setSeats] = useState({});
  const [loadingSeats, setLoadingSeats] = useState({});
  const [seatsError, setSeatsError] = useState({});

  // Seat configuration form state
  const [showSeatConfigForm, setShowSeatConfigForm] = useState({});
  const [seatConfigRows, setSeatConfigRows] = useState({});
  const [seatConfigErrors, setSeatConfigErrors] = useState({});
  const [isSubmittingSeatConfig, setIsSubmittingSeatConfig] = useState({});

  // Seat classes state
  const [seatClasses, setSeatClasses] = useState([]);
  const [loadingSeatClasses, setLoadingSeatClasses] = useState(false);

  // Seat statuses state
  const [seatStatuses, setSeatStatuses] = useState([]);
  const [loadingSeatStatuses, setLoadingSeatStatuses] = useState(false);

  // Screenings by hall state
  const [screeningsByHall, setScreeningsByHall] = useState({});
  const [loadingScreenings, setLoadingScreenings] = useState({});
  const [screeningsError, setScreeningsError] = useState({});
  const [expandedScreeningsHallId, setExpandedScreeningsHallId] = useState(null);

  // Booking state
  const [bookingScreening, setBookingScreening] = useState(null);
  const [bookingTickets, setBookingTickets] = useState([]);
  const [bookingError, setBookingError] = useState(null);
  const [seatsLocked, setSeatsLocked] = useState(false);
  const [isLockingSeats, setIsLockingSeats] = useState(false);
  const bookingSectionRef = useRef(null);

  // Locked seats tab state
  const [lockedSeats, setLockedSeats] = useState({});
  const [loadingLockedSeats, setLoadingLockedSeats] = useState({});
  const [lockedSeatsError, setLockedSeatsError] = useState({});
  const [selectedScreeningIdForLocked, setSelectedScreeningIdForLocked] = useState({});

  // Bookings tab state (keyed by theaterId)
  const [bookings, setBookings] = useState({});
  const [loadingBookings, setLoadingBookings] = useState({});
  const [bookingsError, setBookingsError] = useState({});

  // Confirm booking modal state (per locked seat)
  const [confirmModal, setConfirmModal] = useState(null); // { screenId, seatId, seatIdentifier, hallId }
  const [confirmForm, setConfirmForm] = useState({ customerName: '', cidOrPassport: '', phoneNumber: '', email: '' });
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [confirmBookingError, setConfirmBookingError] = useState(null);

  // Edit screening state
  const [editingScreening, setEditingScreening] = useState(null);
  const [editScreeningData, setEditScreeningData] = useState({});
  const [editScreeningErrors, setEditScreeningErrors] = useState({});
  const [isSubmittingEditScreening, setIsSubmittingEditScreening] = useState(false);

  // Location form state
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationFormData, setLocationFormData] = useState({ dzongkhag: '', thromdoe: '', address: '' });
  const [locationErrors, setLocationErrors] = useState({});
  const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);

  // Movie screening form state
  const [screeningFormData, setScreeningFormData] = useState({
    movieName: '',
    screeningDate: '',
    startTime: '',
    trailerLink: '',
    theaterId: '',
    theaterName: '',
    hallId: '',
    hallName: '',
    isActive: true
  });

  const [screeningErrors, setScreeningErrors] = useState({});
  const [isSubmittingScreening, setIsSubmittingScreening] = useState(false);
  const [showScreeningForm, setShowScreeningForm] = useState(false);
  const [screeningFormTheaterIdFromContext, setScreeningFormTheaterIdFromContext] = useState(null);

  // New explorer UI state
  const [activeHallTab, setActiveHallTab] = useState('screenings');
  const [showAddTheaterModal, setShowAddTheaterModal] = useState(false);
  const [showAddHallModal, setShowAddHallModal] = useState(false);

  // ==================== HELPERS & API CALLS ====================

  const getAllTheaters = () => {
    const allTheaters = [];
    Object.values(theaters).forEach(theaterList => {
      if (Array.isArray(theaterList)) allTheaters.push(...theaterList);
    });
    return allTheaters;
  };

  const getAllHalls = () => {
    const allHalls = [];
    Object.values(halls).forEach(hallList => {
      if (Array.isArray(hallList)) allHalls.push(...hallList);
    });
    return allHalls;
  };

  useEffect(() => {
    fetchTheaterLocations();
    fetchSeatClasses();
    fetchSeatStatuses();
  }, []);

  useEffect(() => {
    if (bookingScreening && bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [bookingScreening]);

  const fetchTheaterLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get('/api/theater-locations');
      let locationsData = [];
      if (response && response.success && Array.isArray(response.data)) locationsData = response.data;
      else if (Array.isArray(response)) locationsData = response;
      else if (response && Array.isArray(response.data)) locationsData = response.data;
      setLocations(locationsData);
    } catch (err) {
      console.error('Error fetching theater locations:', err);
      setError('Failed to load theater locations. Please try again.');
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load theater locations. Please try again.', confirmButtonText: 'OK' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatClasses = async () => {
    try {
      setLoadingSeatClasses(true);
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get('/api/seats/classes');
      let classesData = [];
      if (response && response.success && Array.isArray(response.data)) classesData = response.data;
      else if (Array.isArray(response)) classesData = response;
      else if (response && Array.isArray(response.data)) classesData = response.data;
      setSeatClasses(classesData);
    } catch (err) {
      console.error('Error fetching seat classes:', err);
    } finally {
      setLoadingSeatClasses(false);
    }
  };

  const fetchSeatStatuses = async () => {
    try {
      setLoadingSeatStatuses(true);
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get('/api/seats/statuses');
      let statusesData = [];
      if (response && response.success && Array.isArray(response.data)) statusesData = response.data;
      else if (Array.isArray(response)) statusesData = response;
      else if (response && Array.isArray(response.data)) statusesData = response.data;
      setSeatStatuses(statusesData);
    } catch (err) {
      console.error('Error fetching seat statuses:', err);
    } finally {
      setLoadingSeatStatuses(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const handleLocationInputChange = (field, value) => {
    setLocationFormData(prev => ({ ...prev, [field]: value }));
    if (locationErrors[field]) {
      setLocationErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateLocationForm = () => {
    const newErrors = {};
    if (!locationFormData.dzongkhag.trim()) newErrors.dzongkhag = 'Dzongkhag is required';
    else if (locationFormData.dzongkhag.trim().length < 2) newErrors.dzongkhag = 'Dzongkhag must be at least 2 characters';
    else if (locationFormData.dzongkhag.trim().length > 100) newErrors.dzongkhag = 'Dzongkhag must be less than 100 characters';

    if (!locationFormData.thromdoe.trim()) newErrors.thromdoe = 'Thromdoe is required';
    else if (locationFormData.thromdoe.trim().length < 2) newErrors.thromdoe = 'Thromdoe must be at least 2 characters';
    else if (locationFormData.thromdoe.trim().length > 100) newErrors.thromdoe = 'Thromdoe must be less than 100 characters';

    if (!locationFormData.address.trim()) newErrors.address = 'Address is required';
    else if (locationFormData.address.trim().length < 5) newErrors.address = 'Address must be at least 5 characters';
    else if (locationFormData.address.trim().length > 500) newErrors.address = 'Address must be less than 500 characters';

    setLocationErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    const validation = validateLocationForm();
    if (!validation.isValid) {
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(`location-${firstErrorField}`);
      if (errorElement) { errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); errorElement.focus(); }
      return;
    }
    setIsSubmittingLocation(true);
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const payload = { dzongkhag: locationFormData.dzongkhag.trim(), thromdoe: locationFormData.thromdoe.trim(), address: locationFormData.address.trim() };
      await apiClient.post('/api/theater-locations', payload);
      await Swal.fire({ icon: 'success', title: 'Success!', text: 'Theater location created successfully.', confirmButtonText: 'OK', confirmButtonColor: '#10b981' });
      setLocationFormData({ dzongkhag: '', thromdoe: '', address: '' });
      setLocationErrors({});
      setShowLocationForm(false);
      fetchTheaterLocations();
    } catch (error) {
      console.error('Error creating theater location:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error?.response?.data?.message || 'Failed to create theater location. Please try again.', confirmButtonText: 'OK' });
    } finally {
      setIsSubmittingLocation(false);
    }
  };

  const handleLocationReset = () => {
    setLocationFormData({ dzongkhag: '', thromdoe: '', address: '' });
    setLocationErrors({});
  };

  const fetchTheaters = async (locationId) => {
    try {
      setLoadingTheaters(prev => ({ ...prev, [locationId]: true }));
      setTheatersError(prev => ({ ...prev, [locationId]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get(`/api/theaters/location/${locationId}`);
      let theatersData = [];
      if (response && response.success && Array.isArray(response.data)) theatersData = response.data;
      else if (Array.isArray(response)) theatersData = response;
      else if (response && Array.isArray(response.data)) theatersData = response.data;
      setTheaters(prev => ({ ...prev, [locationId]: theatersData }));
    } catch (err) {
      console.error('Error fetching theaters:', err);
      setTheatersError(prev => ({ ...prev, [locationId]: 'Failed to load theaters. Please try again.' }));
    } finally {
      setLoadingTheaters(prev => ({ ...prev, [locationId]: false }));
    }
  };

  const handleToggleTheaters = (locationId) => {
    if (expandedLocationId === locationId) {
      setExpandedLocationId(null);
      setShowTheaterForm(prev => ({ ...prev, [locationId]: false }));
    } else {
      setExpandedLocationId(locationId);
      if (!theaters[locationId]) fetchTheaters(locationId);
    }
  };

  const handleTheaterInputChange = (locationId, field, value) => {
    setTheaterFormData(prev => ({ ...prev, [locationId]: { ...prev[locationId], [field]: value } }));
    if (theaterErrors[locationId]?.[field]) {
      setTheaterErrors(prev => ({ ...prev, [locationId]: { ...prev[locationId], [field]: undefined } }));
    }
  };

  const validateTheaterForm = (locationId) => {
    const formData = theaterFormData[locationId] || {};
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Theater name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Theater name must be at least 2 characters';
    else if (formData.name.trim().length > 200) newErrors.name = 'Theater name must be less than 200 characters';
    if (formData.description?.trim() && formData.description.trim().length > 1000) newErrors.description = 'Description must be less than 1000 characters';
    setTheaterErrors(prev => ({ ...prev, [locationId]: newErrors }));
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleTheaterSubmit = async (e, locationId) => {
    e.preventDefault();
    const validation = validateTheaterForm(locationId);
    if (!validation.isValid) {
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(`theater-${locationId}-${firstErrorField}`);
      if (errorElement) { errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); errorElement.focus(); }
      return;
    }
    setIsSubmittingTheater(prev => ({ ...prev, [locationId]: true }));
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const formData = theaterFormData[locationId] || {};
      const adminUserId = user?.userId || user?.keycloakId || '';
      const payload = { name: formData.name.trim(), description: formData.description?.trim() || '', locationId: locationId, adminUserId: adminUserId };
      await apiClient.post('/api/theaters', payload);
      await Swal.fire({ icon: 'success', title: 'Success!', text: 'Theater created successfully.', confirmButtonText: 'OK', confirmButtonColor: '#10b981' });
      setTheaterFormData(prev => ({ ...prev, [locationId]: { name: '', description: '' } }));
      setTheaterErrors(prev => ({ ...prev, [locationId]: {} }));
      setShowTheaterForm(prev => ({ ...prev, [locationId]: false }));
      setShowAddTheaterModal(false);
      fetchTheaters(locationId);
    } catch (error) {
      console.error('Error creating theater:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error?.response?.data?.message || 'Failed to create theater. Please try again.', confirmButtonText: 'OK' });
    } finally {
      setIsSubmittingTheater(prev => ({ ...prev, [locationId]: false }));
    }
  };

  const handleToggleTheaterForm = (locationId) => {
    setShowTheaterForm(prev => ({ ...prev, [locationId]: !prev[locationId] }));
    if (!theaterFormData[locationId]) setTheaterFormData(prev => ({ ...prev, [locationId]: { name: '', description: '' } }));
  };

  const fetchHalls = async (theaterId, skipCache = false) => {
    try {
      setLoadingHalls(prev => ({ ...prev, [theaterId]: true }));
      setHallsError(prev => ({ ...prev, [theaterId]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const url = skipCache ? `/api/halls/theater/${theaterId}?_=${Date.now()}` : `/api/halls/theater/${theaterId}`;
      const response = await apiClient.get(url);
      let hallsData = [];
      if (response && response.success && Array.isArray(response.data)) hallsData = response.data;
      else if (Array.isArray(response)) hallsData = response;
      else if (response && Array.isArray(response.data)) hallsData = response.data;
      else if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) hallsData = [response.data];
      setHalls(prev => ({ ...prev, [theaterId]: hallsData }));
    } catch (err) {
      console.error('Error fetching halls:', err);
      setHallsError(prev => ({ ...prev, [theaterId]: 'Failed to load halls. Please try again.' }));
    } finally {
      setLoadingHalls(prev => ({ ...prev, [theaterId]: false }));
    }
  };

  const handleToggleHalls = (theaterId) => {
    if (expandedTheaterId === theaterId) {
      setExpandedTheaterId(null);
      setShowHallForm(prev => ({ ...prev, [theaterId]: false }));
    } else {
      setExpandedTheaterId(theaterId);
      if (!halls[theaterId]) fetchHalls(theaterId);
    }
  };

  const handleHallInputChange = (theaterId, field, value) => {
    setHallFormData(prev => ({ ...prev, [theaterId]: { ...prev[theaterId], [field]: value } }));
    if (hallErrors[theaterId]?.[field]) {
      setHallErrors(prev => ({ ...prev, [theaterId]: { ...prev[theaterId], [field]: undefined } }));
    }
  };

  const validateHallForm = (theaterId) => {
    const formData = hallFormData[theaterId] || {};
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Hall name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Hall name must be at least 2 characters';
    else if (formData.name.trim().length > 100) newErrors.name = 'Hall name must be less than 100 characters';
    if (!formData.totalSeats || formData.totalSeats === '') newErrors.totalSeats = 'Total seats is required';
    else if (isNaN(parseInt(formData.totalSeats))) newErrors.totalSeats = 'Total seats must be a valid number';
    else if (parseInt(formData.totalSeats) < 1) newErrors.totalSeats = 'Total seats must be at least 1';
    else if (parseInt(formData.totalSeats) > 1000) newErrors.totalSeats = 'Total seats cannot exceed 1000';
    setHallErrors(prev => ({ ...prev, [theaterId]: newErrors }));
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleHallSubmit = async (e, theaterId) => {
    e.preventDefault();
    const validation = validateHallForm(theaterId);
    if (!validation.isValid) {
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(`hall-${theaterId}-${firstErrorField}`);
      if (errorElement) { errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); errorElement.focus(); }
      return;
    }
    setIsSubmittingHall(prev => ({ ...prev, [theaterId]: true }));
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const formData = hallFormData[theaterId] || {};
      const payload = { name: formData.name.trim(), totalSeats: parseInt(formData.totalSeats), theaterId: theaterId };
      const response = await apiClient.post('/api/halls', payload);
      const createdHall = response?.data ?? response;
      if (createdHall && typeof createdHall === 'object' && (createdHall.id != null || createdHall.name != null)) {
        const hallToAdd = { id: createdHall.id, name: createdHall.name ?? formData.name?.trim(), totalSeats: createdHall.totalSeats ?? parseInt(formData.totalSeats), theaterId: createdHall.theaterId ?? theaterId };
        setHalls(prev => ({ ...prev, [theaterId]: [...(prev[theaterId] || []), hallToAdd] }));
      }
      await Swal.fire({ icon: 'success', title: 'Success!', text: 'Hall created successfully.', confirmButtonText: 'OK', confirmButtonColor: '#10b981' });
      setHallFormData(prev => ({ ...prev, [theaterId]: { name: '', totalSeats: '' } }));
      setHallErrors(prev => ({ ...prev, [theaterId]: {} }));
      setShowHallForm(prev => ({ ...prev, [theaterId]: false }));
      setShowAddHallModal(false);
      await fetchHalls(theaterId, true);
    } catch (error) {
      console.error('Error creating hall:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error?.response?.data?.message || 'Failed to create hall. Please try again.', confirmButtonText: 'OK' });
    } finally {
      setIsSubmittingHall(prev => ({ ...prev, [theaterId]: false }));
    }
  };

  const handleToggleHallForm = (theaterId) => {
    setShowHallForm(prev => ({ ...prev, [theaterId]: !prev[theaterId] }));
    if (!hallFormData[theaterId]) setHallFormData(prev => ({ ...prev, [theaterId]: { name: '', totalSeats: '' } }));
  };

  const fetchSeats = async (hallId) => {
    try {
      setLoadingSeats(prev => ({ ...prev, [hallId]: true }));
      setSeatsError(prev => ({ ...prev, [hallId]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get(`/api/seats/hall/${hallId}`);
      let seatsData = [];
      if (response && response.success && Array.isArray(response.data)) seatsData = response.data;
      else if (Array.isArray(response)) seatsData = response;
      else if (response && Array.isArray(response.data)) seatsData = response.data;
      setSeats(prev => ({ ...prev, [hallId]: seatsData }));
    } catch (err) {
      console.error('Error fetching seats:', err);
      setSeatsError(prev => ({ ...prev, [hallId]: 'Failed to load seats. Please try again.' }));
    } finally {
      setLoadingSeats(prev => ({ ...prev, [hallId]: false }));
    }
  };

  const fetchScreenings = async (hallId, skipCache = false) => {
    try {
      setLoadingScreenings(prev => ({ ...prev, [hallId]: true }));
      setScreeningsError(prev => ({ ...prev, [hallId]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const url = skipCache ? `/api/screenings/hall/${hallId}?_=${Date.now()}` : `/api/screenings/hall/${hallId}`;
      const response = await apiClient.get(url);
      let screeningsData = [];
      if (response && response.success && Array.isArray(response.data)) screeningsData = response.data;
      else if (Array.isArray(response)) screeningsData = response;
      else if (response && Array.isArray(response.data)) screeningsData = response.data;
      setScreeningsByHall(prev => ({ ...prev, [hallId]: screeningsData }));
    } catch (err) {
      console.error('Error fetching screenings:', err);
      setScreeningsError(prev => ({ ...prev, [hallId]: 'Failed to load screenings. Please try again.' }));
    } finally {
      setLoadingScreenings(prev => ({ ...prev, [hallId]: false }));
    }
  };

  const handleToggleScreenings = (hallId) => {
    if (expandedScreeningsHallId === hallId) {
      setExpandedScreeningsHallId(null);
    } else {
      setExpandedScreeningsHallId(hallId);
      if (!screeningsByHall[hallId]) fetchScreenings(hallId);
    }
  };

  const formatStartTime = (startTime) => {
    if (!startTime || typeof startTime !== 'object') return '--:--';
    const h = startTime.hour != null ? String(startTime.hour).padStart(2, '0') : '00';
    const m = startTime.minute != null ? String(startTime.minute).padStart(2, '0') : '00';
    return `${h}:${m}`;
  };

  const openBooking = (screening) => {
    setBookingScreening(screening);
    setBookingTickets([]);
    setBookingError(null);
    if (screening?.hallId && !seats[screening.hallId]) fetchSeats(screening.hallId);
  };

  const closeBooking = () => {
    setBookingScreening(null);
    setBookingTickets([]);
    setBookingError(null);
    setSeatsLocked(false);
  };

  const handleLockSeats = async () => {
    if (!bookingScreening || bookingTickets.length === 0) return;
    setIsLockingSeats(true);
    setBookingError(null);
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const lockPayloadFor = (t) => ({ seatId: t.seatId, hallId: bookingScreening.hallId, seatClassId: t.seat?.seatClassId, userId: user?.userId, screenId: bookingScreening.id });
      for (const t of bookingTickets) {
        const lockRes = await apiClient.post('/api/bookings/toggle-lock', lockPayloadFor(t));
        const status = lockRes?.data?.status ?? lockRes?.status;
        if (status === 'UNLOCKED') await apiClient.post('/api/bookings/toggle-lock', lockPayloadFor(t));
      }
      setSeatsLocked(true);
      await fetchSeats(bookingScreening.hallId);
      setSelectedScreeningIdForLocked(prev => ({ ...prev, [bookingScreening.hallId]: bookingScreening.id }));
      fetchLockedSeats(bookingScreening.id, bookingScreening.hallId);
    } catch (err) {
      setBookingError(err?.response?.data?.message || 'Failed to lock seats. Please try again.');
    } finally {
      setIsLockingSeats(false);
    }
  };

  const openEditScreening = (screening) => {
    const st = screening.startTime;
    const timeStr = st && typeof st === 'object'
      ? `${String(st.hour ?? 0).padStart(2, '0')}:${String(st.minute ?? 0).padStart(2, '0')}`
      : (typeof st === 'string' ? st : '');
    setEditingScreening(screening);
    setEditScreeningData({ movieName: screening.movieName ?? '', screeningDate: screening.screeningDate ?? '', startTime: timeStr, trailerLink: screening.trailerLink ?? '', isActive: screening.isActive ?? true });
    setEditScreeningErrors({});
  };

  const closeEditScreening = () => {
    setEditingScreening(null);
    setEditScreeningData({});
    setEditScreeningErrors({});
  };

  const handleUpdateScreening = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editScreeningData.movieName?.trim()) errors.movieName = 'Required';
    if (!editScreeningData.screeningDate) errors.screeningDate = 'Required';
    if (!editScreeningData.startTime) errors.startTime = 'Required';
    if (Object.keys(errors).length) { setEditScreeningErrors(errors); return; }
    setIsSubmittingEditScreening(true);
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const payload = {
        movieName: editScreeningData.movieName.trim(),
        screeningDate: editScreeningData.screeningDate,
        startTime: convertTo24HourFormat(editScreeningData.startTime),
        trailerLink: editScreeningData.trailerLink?.trim() || '',
        hallId: editingScreening.hallId,
        hallName: editingScreening.hallName,
        isActive: editScreeningData.isActive,
      };
      const response = await apiClient.put(`/api/screenings/${editingScreening.id}`, payload);
      if (response?.success !== false) {
        await Swal.fire({ icon: 'success', title: 'Updated', text: 'Screening updated successfully.', timer: 1500, showConfirmButton: false });
        fetchScreenings(editingScreening.hallId, true);
        closeEditScreening();
      } else {
        setEditScreeningErrors({ submit: response?.message || 'Update failed.' });
      }
    } catch (err) {
      setEditScreeningErrors({ submit: err?.response?.data?.message || 'Failed to update screening.' });
    } finally {
      setIsSubmittingEditScreening(false);
    }
  };

  const handleDeleteScreening = async (screening) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Delete Screening?', text: `"${screening.movieName}" on ${screening.screeningDate} will be permanently removed.`, showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#ef4444' });
    if (!result.isConfirmed) return;
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      await apiClient.delete(`/api/screenings/${screening.id}`);
      fetchScreenings(screening.hallId, true);
      await Swal.fire({ icon: 'success', title: 'Deleted', text: 'Screening removed.', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to delete screening.' });
    }
  };

  const toggleSeatForBooking = (seat) => {
    const exists = bookingTickets.some(t => t.seatId === seat.id);
    if (exists) {
      setBookingTickets(prev => prev.filter(t => t.seatId !== seat.id));
    } else {
      setBookingTickets(prev => [...prev, { seatId: seat.id, seat, customerName: '', cidOrPassport: '', phoneNumber: '', email: '' }]);
    }
  };

  const openConfirmModal = (screenId, seatId, seatIdentifier) => {
    setConfirmModal({ screenId, seatId, seatIdentifier, hallId: expandedHallId });
    setConfirmForm({ customerName: '', cidOrPassport: '', phoneNumber: '', email: '' });
    setConfirmBookingError(null);
  };

  const closeConfirmModal = () => {
    setConfirmModal(null);
    setConfirmForm({ customerName: '', cidOrPassport: '', phoneNumber: '', email: '' });
    setConfirmBookingError(null);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!confirmModal) return;
    const { customerName, cidOrPassport, phoneNumber, email } = confirmForm;
    if (!customerName.trim()) { setConfirmBookingError('Customer name is required.'); return; }
    if (!cidOrPassport.trim()) { setConfirmBookingError('CID/Passport is required.'); return; }
    if (!phoneNumber.trim()) { setConfirmBookingError('Phone number is required.'); return; }
    if (!email.trim()) { setConfirmBookingError('Email is required.'); return; }
    setIsConfirmingBooking(true);
    setConfirmBookingError(null);
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const payload = {
        screeningId: confirmModal.screenId,
        tickets: [{ seatId: confirmModal.seatId, customerName: customerName.trim(), cidOrPassport: cidOrPassport.trim(), phoneNumber: phoneNumber.trim(), email: email.trim() }],
        userId: user?.userId,
      };
      const response = await apiClient.post('/api/bookings/book', payload);
      const success = response?.success !== false;
      if (success) {
        await Swal.fire({ icon: 'success', title: 'Booked', text: `Seat ${confirmModal.seatIdentifier} booked successfully.`, timer: 1500, showConfirmButton: false });
        closeConfirmModal();
        fetchLockedSeats(confirmModal.screenId, confirmModal.hallId);
      } else {
        setConfirmBookingError(response?.message || 'Booking failed.');
      }
    } catch (err) {
      setConfirmBookingError(err?.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsConfirmingBooking(false);
    }
  };

  const fetchLockedSeats = async (screenId, hallId) => {
    const key = `${screenId}-${hallId}`;
    try {
      setLoadingLockedSeats(prev => ({ ...prev, [key]: true }));
      setLockedSeatsError(prev => ({ ...prev, [key]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get(`/api/bookings/locked/${screenId}/hall/${hallId}`);
      // Response: { success, data: { screenId, hallId, lockedSeatIdsByClass: { CLASS_NAME: [seatId, ...] } } }
      const payload = response?.data ?? response;
      const lockedSeatIdsByClass = payload?.lockedSeatIdsByClass ?? {};
      setLockedSeats(prev => ({ ...prev, [key]: lockedSeatIdsByClass }));
    } catch (err) {
      setLockedSeatsError(prev => ({ ...prev, [key]: 'Failed to load locked seats.' }));
    } finally {
      setLoadingLockedSeats(prev => ({ ...prev, [key]: false }));
    }
  };

  const fetchBookings = async (theaterId) => {
    try {
      setLoadingBookings(prev => ({ ...prev, [theaterId]: true }));
      setBookingsError(prev => ({ ...prev, [theaterId]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get(`/api/bookings/fetchAllbooking/${theaterId}`);
      let list = [];
      if (response?.success && Array.isArray(response.data)) list = response.data;
      else if (Array.isArray(response.data)) list = response.data;
      else if (Array.isArray(response)) list = response;
      setBookings(prev => ({ ...prev, [theaterId]: list }));
    } catch (err) {
      setBookingsError(prev => ({ ...prev, [theaterId]: 'Failed to load bookings.' }));
    } finally {
      setLoadingBookings(prev => ({ ...prev, [theaterId]: false }));
    }
  };

  const handleCancelTicket = async (ticketNumber) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancel Ticket?',
      text: `Ticket ${ticketNumber} will be cancelled and the seat released.`,
      showCancelButton: true,
      confirmButtonText: 'Cancel Ticket',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Keep',
    });
    if (!result.isConfirmed) return;
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      await apiClient.post(`/api/bookings/cancel/ticket/${ticketNumber}`);
      await Swal.fire({ icon: 'success', title: 'Ticket Cancelled', timer: 1200, showConfirmButton: false });
      fetchBookings(expandedTheaterId);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to cancel ticket.' });
    }
  };

  const handleCancelBooking = async (bookingRef) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancel Entire Booking?',
      text: `Booking ${bookingRef} and all its tickets will be cancelled.`,
      showCancelButton: true,
      confirmButtonText: 'Cancel Booking',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Keep',
    });
    if (!result.isConfirmed) return;
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      await apiClient.post(`/api/bookings/cancel/booking/${bookingRef}`);
      await Swal.fire({ icon: 'success', title: 'Booking Cancelled', timer: 1200, showConfirmButton: false });
      fetchBookings(expandedTheaterId);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to cancel booking.' });
    }
  };

  const handleToggleSeats = (hallId) => {
    if (expandedHallId === hallId) {
      setExpandedHallId(null);
      setShowSeatConfigForm(prev => ({ ...prev, [hallId]: false }));
    } else {
      setExpandedHallId(hallId);
      if (!seats[hallId]) fetchSeats(hallId);
    }
  };

  const handleToggleSeatConfigForm = (hallId) => {
    const willShow = !showSeatConfigForm[hallId];
    setShowSeatConfigForm(prev => ({ ...prev, [hallId]: willShow }));
    if (willShow) {
      setExpandedHallId(hallId);
      if (!seats[hallId]) fetchSeats(hallId);
    }
    if (!seatConfigRows[hallId] || seatConfigRows[hallId].length === 0) {
      setSeatConfigRows(prev => ({ ...prev, [hallId]: [{ rowName: '', seatCount: '', seatClassId: '', seatStatusId: '', basePrice: 0 }] }));
    }
  };

  const handleAddSeatConfigRow = (hallId) => {
    setSeatConfigRows(prev => ({ ...prev, [hallId]: [...(prev[hallId] || []), { rowName: '', seatCount: '', seatClassId: '', seatStatusId: '', basePrice: 0 }] }));
  };

  const handleRemoveSeatConfigRow = (hallId, rowIndex) => {
    setSeatConfigRows(prev => ({ ...prev, [hallId]: prev[hallId].filter((_, index) => index !== rowIndex) }));
    setSeatConfigErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[hallId]) {
        const hErrs = { ...newErrors[hallId] };
        delete hErrs[rowIndex];
        const shiftedErrors = {};
        Object.keys(hErrs).forEach(key => {
          const keyNum = parseInt(key);
          if (keyNum > rowIndex) shiftedErrors[keyNum - 1] = hErrs[key];
          else shiftedErrors[key] = hErrs[key];
        });
        newErrors[hallId] = shiftedErrors;
      }
      return newErrors;
    });
  };

  const handleSeatConfigRowChange = (hallId, rowIndex, field, value) => {
    setSeatConfigRows(prev => ({
      ...prev,
      [hallId]: prev[hallId].map((row, index) => {
        if (index === rowIndex) {
          const updatedRow = { ...row, [field]: value };
          if (field === 'seatClassId' && value) {
            const selectedClass = seatClasses.find(cls => cls.id === parseInt(value));
            if (selectedClass && selectedClass.defaultBasePrice !== undefined) updatedRow.basePrice = selectedClass.defaultBasePrice;
          }
          return updatedRow;
        }
        return row;
      })
    }));
    if (seatConfigErrors[hallId]?.[rowIndex]?.[field]) {
      setSeatConfigErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[hallId]?.[rowIndex]) newErrors[hallId] = { ...newErrors[hallId], [rowIndex]: { ...newErrors[hallId][rowIndex], [field]: undefined } };
        return newErrors;
      });
    }
  };

  const validateSeatConfig = (hallId) => {
    const rows = seatConfigRows[hallId] || [];
    const newErrors = {};
    if (rows.length === 0) return { isValid: false, errors: { general: 'At least one row is required' } };
    rows.forEach((row, index) => {
      const rowErrors = {};
      if (!row.rowName?.trim()) rowErrors.rowName = 'Row name is required';
      else if (row.rowName.trim().length > 10) rowErrors.rowName = 'Max 10 chars';
      if (!row.seatCount || row.seatCount === '') rowErrors.seatCount = 'Required';
      else if (isNaN(parseInt(row.seatCount)) || parseInt(row.seatCount) < 1) rowErrors.seatCount = 'Invalid';
      if (!row.seatClassId) rowErrors.seatClassId = 'Required';
      if (!row.seatStatusId) rowErrors.seatStatusId = 'Required';
      if (row.basePrice === undefined || row.basePrice === '') rowErrors.basePrice = 'Required';
      if (Object.keys(rowErrors).length > 0) newErrors[index] = rowErrors;
    });
    const totalConfigured = rows.reduce((sum, row) => sum + (parseInt(row.seatCount, 10) || 0), 0);
    if (totalConfigured > MAX_SEATS_PER_HALL) newErrors.general = `Seat total (${totalConfigured}) exceeds maximum allowed (${MAX_SEATS_PER_HALL}) for this hall.`;
    setSeatConfigErrors(prev => ({ ...prev, [hallId]: newErrors }));
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSeatConfigSubmit = async (e, hallId) => {
    e.preventDefault();
    const validation = validateSeatConfig(hallId);
    if (!validation.isValid) {
      const firstErrorRow = Object.keys(validation.errors)[0];
      if (firstErrorRow !== 'general') {
        const errorElement = document.getElementById(`seat-config-${hallId}-row-${firstErrorRow}`);
        if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setIsSubmittingSeatConfig(prev => ({ ...prev, [hallId]: true }));
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const rows = seatConfigRows[hallId] || [];
      const payload = { hallId: hallId, rows: rows.map(row => ({ rowName: row.rowName.trim(), seatCount: parseInt(row.seatCount), seatClassId: parseInt(row.seatClassId), seatStatusId: parseInt(row.seatStatusId), basePrice: parseFloat(row.basePrice) })) };
      await apiClient.post('/api/seats/configure', payload);
      await Swal.fire({ icon: 'success', title: 'Success!', text: 'Seats configured successfully.', confirmButtonText: 'OK', confirmButtonColor: '#10b981' });
      setSeatConfigRows(prev => ({ ...prev, [hallId]: [{ rowName: '', seatCount: '', seatClassId: '', seatStatusId: '', basePrice: 0 }] }));
      setSeatConfigErrors(prev => ({ ...prev, [hallId]: {} }));
      setShowSeatConfigForm(prev => ({ ...prev, [hallId]: false }));
      fetchSeats(hallId);
    } catch (error) {
      console.error('Error configuring seats:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error?.response?.data?.message || 'Failed to configure seats. Please try again.', confirmButtonText: 'OK' });
    } finally {
      setIsSubmittingSeatConfig(prev => ({ ...prev, [hallId]: false }));
    }
  };

  const handleScreeningInputChange = (field, value) => {
    setScreeningFormData(prev => ({ ...prev, [field]: value }));
    if (screeningErrors[field]) setScreeningErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleTimeChange = (value) => {
    setScreeningFormData(prev => ({ ...prev, startTime: value }));
    if (screeningErrors.startTime) setScreeningErrors(prev => { const n = { ...prev }; delete n.startTime; return n; });
  };

  const convertTo24HourFormat = (timeString) => {
    if (!timeString) return '00:00:00';
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    }
    return '00:00:00';
  };

  const handleTheaterChange = (theaterId) => {
    const allTheaters = getAllTheaters();
    const sel = allTheaters.find(t => t.id === parseInt(theaterId));
    setScreeningFormData(prev => ({ ...prev, theaterId: theaterId ? parseInt(theaterId) : '', theaterName: sel?.name || '', hallId: '', hallName: '' }));
    if (screeningErrors.theaterId) setScreeningErrors(prev => { const n = { ...prev }; delete n.theaterId; return n; });
    if (theaterId && !halls[theaterId]) fetchHalls(theaterId);
  };

  const handleHallChange = (hallId) => {
    const allHalls = getAllHalls();
    const sel = allHalls.find(h => h.id === parseInt(hallId));
    setScreeningFormData(prev => ({ ...prev, hallId: hallId ? parseInt(hallId) : '', hallName: sel?.name || '' }));
    if (screeningErrors.hallId) setScreeningErrors(prev => { const n = { ...prev }; delete n.hallId; return n; });
  };

  const validateScreeningForm = () => {
    const newErrors = {};
    if (!screeningFormData.movieName.trim()) newErrors.movieName = 'Movie name is required';
    else if (screeningFormData.movieName.trim().length < 2) newErrors.movieName = 'Min 2 chars';
    if (!screeningFormData.screeningDate.trim()) newErrors.screeningDate = 'Date required';
    else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const selected = new Date(screeningFormData.screeningDate);
      if (selected < today) newErrors.screeningDate = 'Cannot be in past';
    }
    if (!screeningFormData.startTime) newErrors.startTime = 'Time required';
    if (!screeningFormData.theaterId) newErrors.theaterId = 'Theater required';
    if (!screeningFormData.hallId) newErrors.hallId = 'Hall required';
    if (screeningFormData.trailerLink.trim()) {
      try { new URL(screeningFormData.trailerLink); } catch { newErrors.trailerLink = 'Invalid URL'; }
    }
    setScreeningErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScreeningSubmit = async (e) => {
    e.preventDefault();
    if (!validateScreeningForm()) {
      const firstErrorField = Object.keys(screeningErrors)[0];
      const errorElement = document.getElementById(`screening-${firstErrorField}`);
      if (errorElement) { errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); errorElement.focus(); }
      return;
    }
    setIsSubmittingScreening(true);
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const startTimeString = convertTo24HourFormat(screeningFormData.startTime);
      const payload = { movieName: screeningFormData.movieName.trim(), screeningDate: screeningFormData.screeningDate, startTime: startTimeString, trailerLink: screeningFormData.trailerLink.trim() || '', hallId: screeningFormData.hallId, hallName: screeningFormData.hallName, isActive: screeningFormData.isActive };
      const response = await apiClient.post('/api/screenings', payload);
      const createdForHallId = screeningFormData.hallId;
      const createdScreening = response?.data ?? response;
      if (createdScreening && typeof createdScreening === 'object' && (createdScreening.id != null || createdScreening.movieName != null)) {
        const screeningToAdd = { id: createdScreening.id, movieName: createdScreening.movieName ?? payload.movieName, screeningDate: createdScreening.screeningDate ?? payload.screeningDate, startTime: createdScreening.startTime ?? payload.startTime, trailerLink: createdScreening.trailerLink ?? payload.trailerLink, hallId: createdScreening.hallId ?? payload.hallId, hallName: createdScreening.hallName ?? payload.hallName, theaterName: createdScreening.theaterName ?? screeningFormData.theaterName, isActive: createdScreening.isActive ?? payload.isActive };
        setScreeningsByHall(prev => ({ ...prev, [createdForHallId]: [...(prev[createdForHallId] || []), screeningToAdd] }));
      }
      await Swal.fire({ icon: 'success', title: 'Success!', text: 'Movie screening created successfully.', confirmButtonText: 'OK', confirmButtonColor: '#10b981' });
      setScreeningFormData({ movieName: '', screeningDate: '', startTime: '', trailerLink: '', theaterId: '', theaterName: '', hallId: '', hallName: '', isActive: true });
      setScreeningErrors({});
      setScreeningFormTheaterIdFromContext(null);
      setShowScreeningForm(false);
      if (createdForHallId) await fetchScreenings(createdForHallId, true);
    } catch (error) {
      console.error('Error creating movie screening:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error?.response?.data?.message || 'Failed to create movie screening. Please try again.', confirmButtonText: 'OK' });
    } finally {
      setIsSubmittingScreening(false);
    }
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];

  // New explorer navigation handlers
  const handleLocationSelect = (locationId) => {
    if (expandedLocationId === locationId) return;
    setExpandedLocationId(locationId);
    setExpandedTheaterId(null);
    setExpandedHallId(null);
    if (!theaters[locationId]) fetchTheaters(locationId);
  };

  const handleTheaterSelect = (theaterId) => {
    if (expandedTheaterId === theaterId) return;
    setExpandedTheaterId(theaterId);
    setExpandedHallId(null);
    if (!halls[theaterId]) fetchHalls(theaterId);
  };

  const handleHallSelect = (hallId) => {
    if (expandedHallId === hallId) return;
    setExpandedHallId(hallId);
    if (!seats[hallId]) fetchSeats(hallId);
    if (!screeningsByHall[hallId]) fetchScreenings(hallId);
    setActiveHallTab('screenings');
  };

  const openScreeningFormForHall = () => {
    const theater = (theaters[expandedLocationId] ?? []).find(t => t.id === expandedTheaterId);
    const hall = (halls[expandedTheaterId] ?? []).find(h => h.id === expandedHallId);
    if (!theater || !hall) return;
    setScreeningFormData(prev => ({ ...prev, theaterId: theater.id, theaterName: theater.name, hallId: hall.id, hallName: hall.name }));
    setScreeningFormTheaterIdFromContext(theater.id);
    setShowScreeningForm(true);
  };

  // Derived values for explorer UI
  const selectedLocation = locations.find(l => l.id === expandedLocationId);
  const selectedTheater = (theaters[expandedLocationId] ?? []).find(t => t.id === expandedTheaterId);
  const selectedHall = (halls[expandedTheaterId] ?? []).find(h => h.id === expandedHallId);
  const currentTheaters = theaters[expandedLocationId] ?? [];
  const currentHalls = halls[expandedTheaterId] ?? [];
  const currentScreenings = screeningsByHall[expandedHallId] ?? [];
  const currentSeats = seats[expandedHallId] ?? [];

  // ==================== RENDER ====================

  return (
    <PageWrapper title="Theater Management" description="Manage locations, theaters, halls, and screenings.">

      {/* ── Location Modal ─────────────────────────────────────────────── */}
      {showLocationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowLocationForm(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">New Location</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowLocationForm(false)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleLocationSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location-dzongkhag">Dzongkhag <span className="text-destructive">*</span></Label>
                  <Input id="location-dzongkhag" value={locationFormData.dzongkhag} onChange={(e) => handleLocationInputChange('dzongkhag', e.target.value)} placeholder="e.g. Thimphu" className={locationErrors.dzongkhag ? 'border-destructive' : ''} autoFocus />
                  <FieldError message={locationErrors.dzongkhag} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location-thromdoe">Thromdoe <span className="text-destructive">*</span></Label>
                  <Input id="location-thromdoe" value={locationFormData.thromdoe} onChange={(e) => handleLocationInputChange('thromdoe', e.target.value)} placeholder="e.g. Thimphu Throm" className={locationErrors.thromdoe ? 'border-destructive' : ''} />
                  <FieldError message={locationErrors.thromdoe} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location-address">Address <span className="text-destructive">*</span></Label>
                <Textarea id="location-address" value={locationFormData.address} onChange={(e) => handleLocationInputChange('address', e.target.value)} placeholder="Detailed address..." className={locationErrors.address ? 'border-destructive' : ''} />
                <FieldError message={locationErrors.address} />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={handleLocationReset}>Reset</Button>
                <Button type="submit" className="flex-1" disabled={isSubmittingLocation}>
                  {isSubmittingLocation ? 'Creating...' : 'Create Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Screening Form Modal ────────────────────────────────────────── */}
      {showScreeningForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Clapperboard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Schedule Screening</h2>
                  <p className="text-xs text-muted-foreground">{screeningFormData.hallName} · {screeningFormData.theaterName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowScreeningForm(false)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5">
              <form onSubmit={handleScreeningSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Movie Name <span className="text-destructive">*</span></Label>
                    <Input value={screeningFormData.movieName} onChange={(e) => handleScreeningInputChange('movieName', e.target.value)} placeholder="e.g. Inception" className={screeningErrors.movieName ? 'border-destructive' : ''} />
                    <FieldError message={screeningErrors.movieName} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Trailer Link <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                    <Input value={screeningFormData.trailerLink} onChange={(e) => handleScreeningInputChange('trailerLink', e.target.value)} placeholder="https://youtube.com/..." />
                    <FieldError message={screeningErrors.trailerLink} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date <span className="text-destructive">*</span></Label>
                    <Input type="date" value={screeningFormData.screeningDate} onChange={(e) => handleScreeningInputChange('screeningDate', e.target.value)} min={getMinDate()} className={screeningErrors.screeningDate ? 'border-destructive' : ''} />
                    <FieldError message={screeningErrors.screeningDate} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time <span className="text-destructive">*</span></Label>
                    <Input type="time" value={screeningFormData.startTime} onChange={(e) => handleTimeChange(e.target.value)} className={screeningErrors.startTime ? 'border-destructive' : ''} />
                    <FieldError message={screeningErrors.startTime} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Theater <span className="text-destructive">*</span></Label>
                    <Select value={screeningFormData.theaterId} onChange={(e) => handleTheaterChange(e.target.value)} disabled={screeningFormTheaterIdFromContext != null} className={screeningErrors.theaterId ? 'border-destructive' : ''}>
                      <option value="">Select Theater</option>
                      {getAllTheaters().map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                    <FieldError message={screeningErrors.theaterId} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Hall <span className="text-destructive">*</span></Label>
                    <Select value={screeningFormData.hallId} onChange={(e) => handleHallChange(e.target.value)} disabled={!screeningFormData.theaterId} className={screeningErrors.hallId ? 'border-destructive' : ''}>
                      <option value="">Select Hall</option>
                      {screeningFormData.theaterId && halls[screeningFormData.theaterId]?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </Select>
                    <FieldError message={screeningErrors.hallId} />
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Active Immediately</p>
                    <p className="text-xs text-muted-foreground">Customers can book immediately</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={screeningFormData.isActive}
                    onClick={() => handleScreeningInputChange('isActive', !screeningFormData.isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${screeningFormData.isActive ? 'bg-primary' : 'bg-input'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${screeningFormData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowScreeningForm(false)} disabled={isSubmittingScreening}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={isSubmittingScreening}>
                    {isSubmittingScreening ? 'Saving...' : 'Create Screening'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Screening Modal ────────────────────────────────────────── */}
      {editingScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-card border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Pencil className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Edit Screening</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={closeEditScreening} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5">
              <form onSubmit={handleUpdateScreening} className="space-y-4">
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                  Hall: <span className="font-medium text-foreground">{editingScreening.hallName}</span>
                </div>
                <div className="space-y-1.5">
                  <Label>Movie Name <span className="text-destructive">*</span></Label>
                  <Input value={editScreeningData.movieName ?? ''} onChange={(e) => setEditScreeningData(p => ({ ...p, movieName: e.target.value }))} className={editScreeningErrors.movieName ? 'border-destructive' : ''} />
                  <FieldError message={editScreeningErrors.movieName} />
                </div>
                <div className="space-y-1.5">
                  <Label>Trailer Link <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                  <Input value={editScreeningData.trailerLink ?? ''} onChange={(e) => setEditScreeningData(p => ({ ...p, trailerLink: e.target.value }))} placeholder="https://youtube.com/..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Date <span className="text-destructive">*</span></Label>
                    <Input type="date" value={editScreeningData.screeningDate ?? ''} onChange={(e) => setEditScreeningData(p => ({ ...p, screeningDate: e.target.value }))} className={editScreeningErrors.screeningDate ? 'border-destructive' : ''} />
                    <FieldError message={editScreeningErrors.screeningDate} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time <span className="text-destructive">*</span></Label>
                    <Input type="time" value={editScreeningData.startTime ?? ''} onChange={(e) => setEditScreeningData(p => ({ ...p, startTime: e.target.value }))} className={editScreeningErrors.startTime ? 'border-destructive' : ''} />
                    <FieldError message={editScreeningErrors.startTime} />
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <input type="checkbox" id="edit-screening-isActive" checked={editScreeningData.isActive ?? true} onChange={(e) => setEditScreeningData(p => ({ ...p, isActive: e.target.checked }))} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                  <Label htmlFor="edit-screening-isActive" className="cursor-pointer font-medium">Active</Label>
                </div>
                {editScreeningErrors.submit && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {editScreeningErrors.submit}
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={closeEditScreening}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={isSubmittingEditScreening}>
                    {isSubmittingEditScreening ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking Modal ───────────────────────────────────────────────── */}
      {bookingScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto" ref={bookingSectionRef}>
          <div className="w-full max-w-5xl bg-card border rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-muted/30">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Ticket className="h-6 w-6 text-primary" /> Booking: {bookingScreening.movieName}
                </h3>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {bookingScreening.screeningDate}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatStartTime(bookingScreening.startTime)}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {bookingScreening.theaterName}, {bookingScreening.hallName}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeBooking}><X className="h-6 w-6" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                <div className="w-full max-w-3xl mx-auto mb-8">
                  <div className="w-full h-2 bg-primary/20 rounded-t-full mb-1 mx-auto relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary tracking-widest uppercase">Screen</div>
                  </div>
                  <div className="w-full h-8 bg-gradient-to-b from-primary/10 to-transparent rounded-b-[50%] mx-auto mb-8"></div>
                  <div className="flex justify-center overflow-x-auto pb-4">
                    {loadingSeats[bookingScreening.hallId] ? (
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : seats[bookingScreening.hallId]?.length > 0 ? (
                      <div className="space-y-3 min-w-max px-4">
                        {(() => {
                          const seatsList = seats[bookingScreening.hallId] || [];
                          const byRow = seatsList.reduce((acc, seat) => {
                            const r = seat.rowName ?? '';
                            if (!acc[r]) acc[r] = [];
                            acc[r].push(seat);
                            return acc;
                          }, {});
                          const rowNames = Object.keys(byRow).sort((a, b) => {
                            const na = parseInt(a, 10); const nb = parseInt(b, 10);
                            if (!isNaN(na) && !isNaN(nb)) return na - nb;
                            return String(a).localeCompare(String(b));
                          });
                          return rowNames.map(rowName => (
                            <div key={rowName} className="flex items-center justify-center gap-4">
                              <span className="text-xs font-bold text-muted-foreground w-6 text-right">{rowName}</span>
                              <div className="flex gap-2">
                                {byRow[rowName].map(seat => {
                                  const selected = bookingTickets.some(t => t.seatId === seat.id);
                                  const disabled = seat.isBlocked;
                                  return (
                                    <button
                                      key={seat.id}
                                      type="button"
                                      onClick={() => !disabled && toggleSeatForBooking(seat)}
                                      disabled={disabled}
                                      title={`${seat.seatClassName} - BTN ${seat.basePrice}`}
                                      className={cn(
                                        'h-8 w-8 text-[10px] rounded-t-md border-b-2 flex items-center justify-center transition-all',
                                        selected ? 'bg-primary text-primary-foreground border-primary-foreground transform -translate-y-1 shadow-md' : disabled ? 'bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-40' : 'bg-card border-primary/30 hover:border-primary hover:bg-primary/5'
                                      )}
                                    >
                                      {seat.seatNumber}
                                    </button>
                                  );
                                })}
                              </div>
                              <span className="text-xs font-bold text-muted-foreground w-6 text-left">{rowName}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-muted/20 rounded-lg">
                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No seats configured.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-6 mt-8 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-card border border-primary/30 rounded-sm"></div> Available</div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-primary rounded-sm"></div> Selected</div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-muted rounded-sm opacity-50"></div> Booked/Blocked</div>
                  </div>
                </div>

                {/* Lock Seats action */}
                {bookingTickets.length > 0 && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      {seatsLocked
                        ? <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium text-green-600 dark:text-green-400">{bookingTickets.length} seat{bookingTickets.length > 1 ? 's' : ''} locked — go to Locked Seats tab to confirm</span></>
                        : <><Lock className="h-4 w-4 text-muted-foreground" /><span>{bookingTickets.length} seat{bookingTickets.length > 1 ? 's' : ''} selected — lock them to proceed</span></>
                      }
                    </div>
                    <div className="flex items-center gap-2">
                      {seatsLocked && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1.5 text-xs text-primary hover:text-primary"
                          onClick={() => { closeBooking(); setActiveHallTab('locked'); }}
                        >
                          View Locked Seats →
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant={seatsLocked ? 'outline' : 'default'}
                        className={`h-8 gap-1.5 text-xs ${seatsLocked ? 'text-green-600 border-green-400 hover:bg-green-50 dark:text-green-400 dark:border-green-700' : ''}`}
                        onClick={handleLockSeats}
                        disabled={isLockingSeats || seatsLocked}
                      >
                        {isLockingSeats
                          ? <><RefreshCw className="h-3 w-3 animate-spin" /> Locking…</>
                          : seatsLocked
                            ? <><CheckCircle2 className="h-3 w-3" /> Locked</>
                            : <><Lock className="h-3 w-3" /> Lock Seats</>
                        }
                      </Button>
                    </div>
                  </div>
                )}
                {bookingError && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4" /> {bookingError}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t bg-muted/30 flex justify-end rounded-b-xl">
              <Button variant="outline" onClick={closeBooking}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Booking Modal ───────────────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-card border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Ticket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Confirm Booking</h2>
                  <p className="text-xs text-muted-foreground">Seat {confirmModal.seatIdentifier}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeConfirmModal} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleConfirmBooking} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={confirmForm.customerName}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter name"
                    autoFocus
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>CID / Passport <span className="text-destructive">*</span></Label>
                  <Input
                    value={confirmForm.cidOrPassport}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, cidOrPassport: e.target.value }))}
                    placeholder="123456789"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone <span className="text-destructive">*</span></Label>
                  <Input
                    type="tel"
                    value={confirmForm.phoneNumber}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="17000000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input
                    type="email"
                    value={confirmForm.email}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              {confirmBookingError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {confirmBookingError}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={closeConfirmModal} disabled={isConfirmingBooking}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isConfirmingBooking}>
                  {isConfirmingBooking ? <><RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> Booking…</> : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Theater Modal ────────────────────────────────────────────── */}
      {showAddTheaterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAddTheaterModal(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md bg-card rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Add Theater</h2>
                  <p className="text-xs text-muted-foreground">{selectedLocation?.dzongkhag}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAddTheaterModal(false)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={(e) => handleTheaterSubmit(e, expandedLocationId)} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`theater-${expandedLocationId}-name`}>Theater Name <span className="text-destructive">*</span></Label>
                <Input
                  id={`theater-${expandedLocationId}-name`}
                  placeholder="e.g. City Cineplex"
                  value={theaterFormData[expandedLocationId]?.name || ''}
                  onChange={(e) => handleTheaterInputChange(expandedLocationId, 'name', e.target.value)}
                  className={theaterErrors[expandedLocationId]?.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                  autoFocus
                />
                <FieldError message={theaterErrors[expandedLocationId]?.name} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`theater-${expandedLocationId}-description`}>Description <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id={`theater-${expandedLocationId}-description`}
                  placeholder="Brief description of the theater"
                  value={theaterFormData[expandedLocationId]?.description || ''}
                  onChange={(e) => handleTheaterInputChange(expandedLocationId, 'description', e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddTheaterModal(false)} disabled={isSubmittingTheater[expandedLocationId]}>Cancel</Button>
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmittingTheater[expandedLocationId]}>
                  {isSubmittingTheater[expandedLocationId] ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</> : <><Plus className="h-4 w-4" />Add Theater</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Hall Modal ───────────────────────────────────────────────── */}
      {showAddHallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAddHallModal(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md bg-card rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <DoorOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Add Hall</h2>
                  <p className="text-xs text-muted-foreground">{selectedTheater?.name}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAddHallModal(false)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={(e) => handleHallSubmit(e, expandedTheaterId)} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`hall-${expandedTheaterId}-name`}>Hall Name <span className="text-destructive">*</span></Label>
                <Input
                  id={`hall-${expandedTheaterId}-name`}
                  placeholder="e.g. Hall A"
                  value={hallFormData[expandedTheaterId]?.name || ''}
                  onChange={(e) => handleHallInputChange(expandedTheaterId, 'name', e.target.value)}
                  className={hallErrors[expandedTheaterId]?.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                  autoFocus
                />
                <FieldError message={hallErrors[expandedTheaterId]?.name} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`hall-${expandedTheaterId}-totalSeats`}>Total Seats <span className="text-destructive">*</span></Label>
                <Input
                  id={`hall-${expandedTheaterId}-totalSeats`}
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="e.g. 120"
                  value={hallFormData[expandedTheaterId]?.totalSeats || ''}
                  onChange={(e) => handleHallInputChange(expandedTheaterId, 'totalSeats', e.target.value)}
                  className={hallErrors[expandedTheaterId]?.totalSeats ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                <FieldError message={hallErrors[expandedTheaterId]?.totalSeats} />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddHallModal(false)} disabled={isSubmittingHall[expandedTheaterId]}>Cancel</Button>
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmittingHall[expandedTheaterId]}>
                  {isSubmittingHall[expandedTheaterId] ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</> : <><Plus className="h-4 w-4" />Add Hall</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Explorer Layout ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row rounded-xl border border-border overflow-hidden bg-card" style={{ minHeight: '560px' }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col">

          {/* LOCATIONS section */}
          <div className="p-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">Locations</span>
              {loading
                ? <RefreshCw className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
                : (
                  <button
                    type="button"
                    onClick={() => setShowLocationForm(true)}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Add location"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )
              }
            </div>

            {error ? (
              <div className="px-2 space-y-1">
                <p className="text-xs text-destructive">{error}</p>
                <button type="button" onClick={fetchTheaterLocations} className="text-xs text-primary hover:underline cursor-pointer">Retry</button>
              </div>
            ) : loading ? (
              <div className="space-y-1">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-9 w-full" />)}
              </div>
            ) : locations.length === 0 ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">No locations found.</p>
            ) : (
              <nav className="space-y-px">
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleLocationSelect(loc.id)}
                    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                      expandedLocationId === loc.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate leading-tight">{loc.dzongkhag}</p>
                      {loc.thromdoe && (
                        <p className={`text-[10px] truncate leading-tight ${expandedLocationId === loc.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {loc.thromdoe}
                        </p>
                      )}
                    </div>
                    {expandedLocationId === loc.id && <ChevronRight className="h-3 w-3 shrink-0 opacity-80" />}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* THEATERS section */}
          {expandedLocationId && (
            <div className="border-t border-border/50 p-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-2 mb-2">
                <Building className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">Theaters</span>
                {loadingTheaters[expandedLocationId]
                  ? <RefreshCw className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
                  : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!theaterFormData[expandedLocationId]) setTheaterFormData(prev => ({ ...prev, [expandedLocationId]: { name: '', description: '' } }));
                        setTheaterErrors(prev => ({ ...prev, [expandedLocationId]: {} }));
                        setShowAddTheaterModal(true);
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      title="Add theater"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )
                }
              </div>

              {theatersError[expandedLocationId] ? (
                <p className="px-2 py-1 text-xs text-destructive">{theatersError[expandedLocationId]}</p>
              ) : loadingTheaters[expandedLocationId] ? (
                <div className="space-y-1">
                  {[1, 2].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : currentTheaters.length === 0 ? (
                <p className="px-2 py-1 text-xs text-muted-foreground">No theaters.</p>
              ) : (
                <nav className="space-y-px">
                  {currentTheaters.map(theater => (
                    <button
                      key={theater.id}
                      type="button"
                      onClick={() => handleTheaterSelect(theater.id)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                        expandedTheaterId === theater.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${theater.isActive ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                      <span className="text-xs font-medium truncate flex-1">{theater.name}</span>
                      {expandedTheaterId === theater.id && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          )}

          {/* HALLS section */}
          {expandedTheaterId && (
            <div className="border-t border-border/50 p-3 flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center gap-1.5 px-2 mb-2">
                <DoorOpen className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">Halls</span>
                {loadingHalls[expandedTheaterId]
                  ? <RefreshCw className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
                  : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!hallFormData[expandedTheaterId]) setHallFormData(prev => ({ ...prev, [expandedTheaterId]: { name: '', totalSeats: '' } }));
                        setHallErrors(prev => ({ ...prev, [expandedTheaterId]: {} }));
                        setShowAddHallModal(true);
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      title="Add hall"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )
                }
              </div>

              {hallsError[expandedTheaterId] ? (
                <p className="px-2 py-1 text-xs text-destructive">{hallsError[expandedTheaterId]}</p>
              ) : loadingHalls[expandedTheaterId] ? (
                <div className="space-y-1">
                  {[1, 2].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : currentHalls.length === 0 ? (
                <p className="px-2 py-1 text-xs text-muted-foreground">No halls.</p>
              ) : (
                <nav className="space-y-px">
                  {currentHalls.map(hall => (
                    <button
                      key={hall.id}
                      type="button"
                      onClick={() => handleHallSelect(hall.id)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                        expandedHallId === hall.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                        {hall.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate leading-tight">{hall.name}</p>
                        <p className={`text-[10px] truncate leading-tight ${expandedHallId === hall.id ? 'text-primary/70' : 'text-muted-foreground'}`}>
                          {hall.totalSeats} seats
                        </p>
                      </div>
                      {expandedHallId === hall.id && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          )}
        </aside>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Breadcrumb bar */}
          <div className="flex items-center gap-1.5 border-b border-border px-5 py-3 bg-card shrink-0">
            <Film className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className={`text-sm ${expandedLocationId ? 'text-foreground' : 'text-muted-foreground'}`}>
              {selectedLocation?.dzongkhag ?? 'No location selected'}
            </span>
            {selectedTheater && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-sm text-foreground truncate">{selectedTheater.name}</span>
              </>
            )}
            {selectedHall && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">{selectedHall.name}</span>
                <span className={`ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  selectedTheater?.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {selectedTheater?.isActive ? 'Active' : 'Inactive'}
                </span>
              </>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* Empty: no location */}
            {!expandedLocationId && !loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center select-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <MapPin className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Select a location</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">Choose a location from the sidebar to get started.</p>
                <Button size="sm" variant="outline" className="mt-4 gap-1.5" onClick={() => setShowLocationForm(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add Location
                </Button>
              </div>
            )}

            {/* Empty: location but no theater */}
            {expandedLocationId && !expandedTheaterId && (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center select-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Building className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Select a theater</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">Pick a theater from the sidebar to see its halls.</p>
              </div>
            )}

            {/* Empty: theater but no hall */}
            {expandedTheaterId && !expandedHallId && (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center select-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <DoorOpen className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Select a hall</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">Pick a hall from the sidebar to manage screenings and seats.</p>
              </div>
            )}

            {/* Hall content */}
            {expandedHallId && selectedHall && (
              <div className="space-y-4">

                {/* Tab bar */}
                <div className="flex border-b border-border -mb-px">
                  <button
                    type="button"
                    onClick={() => setActiveHallTab('screenings')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      activeHallTab === 'screenings'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                    Screenings
                    {screeningsByHall[expandedHallId] !== undefined && (
                      <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-medium text-muted-foreground">
                        {currentScreenings.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHallTab('seats')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      activeHallTab === 'seats'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Armchair className="h-4 w-4" />
                    Seat Layout
                    {seats[expandedHallId] !== undefined && (
                      <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-medium text-muted-foreground">
                        {currentSeats.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHallTab('locked')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      activeHallTab === 'locked'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                    Locked Seats
                    {(() => {
                      const sid = selectedScreeningIdForLocked[expandedHallId];
                      const key = `${sid}-${expandedHallId}`;
                      const byClass = sid && lockedSeats[key];
                      const count = byClass ? Object.values(byClass).reduce((s, ids) => s + (ids?.length ?? 0), 0) : 0;
                      return count > 0 ? (
                        <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
                          {count}
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHallTab('bookings');
                      if (!bookings[expandedTheaterId]) fetchBookings(expandedTheaterId);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      activeHallTab === 'bookings'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Ticket className="h-4 w-4" />
                    Bookings
                    {bookings[expandedTheaterId]?.length > 0 && (
                      <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-medium text-muted-foreground">
                        {bookings[expandedTheaterId].length}
                      </span>
                    )}
                  </button>
                </div>

                {/* ── Screenings Tab ── */}
                {activeHallTab === 'screenings' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">Screenings</h3>
                      {screeningsByHall[expandedHallId] !== undefined && (
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                          {currentScreenings.length}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => fetchScreenings(expandedHallId, true)}
                        className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1 ml-1"
                        disabled={loadingScreenings[expandedHallId]}
                      >
                        <RefreshCw className={`h-3 w-3 ${loadingScreenings[expandedHallId] ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      <Button size="sm" className="ml-auto h-7 gap-1.5 text-xs px-3" onClick={openScreeningFormForHall}>
                        <Plus className="h-3 w-3" /> Add Screening
                      </Button>
                    </div>

                    {loadingScreenings[expandedHallId] ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                      </div>
                    ) : screeningsError[expandedHallId] ? (
                      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                        <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                        <p className="text-sm text-destructive">{screeningsError[expandedHallId]}</p>
                      </div>
                    ) : currentScreenings.length === 0 ? (
                      <div className="rounded-lg border border-dashed py-14 text-center">
                        <Monitor className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No screenings scheduled.</p>
                        <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={openScreeningFormForHall}>
                          <Plus className="h-3.5 w-3.5" /> Schedule First Screening
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_160px] items-center gap-4 px-4 py-2 bg-muted/40 border-b border-border">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Movie</span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Date</span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Time</span>
                          <span />
                        </div>
                        <div className="divide-y divide-border">
                          {currentScreenings.map((s, i) => (
                            <div key={s.id ?? i} className="flex sm:grid sm:grid-cols-[1fr_100px_80px_160px] items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Film className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                  <span className="text-sm font-medium text-foreground truncate block">{s.movieName ?? '—'}</span>
                                  {s.trailerLink && (
                                    <a href={s.trailerLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline truncate block">Trailer</a>
                                  )}
                                </div>
                              </div>
                              <span className="hidden sm:block text-xs text-muted-foreground">{s.screeningDate ?? '—'}</span>
                              <span className="hidden sm:block text-xs text-muted-foreground">{formatStartTime(s.startTime)}</span>
                              <div className="shrink-0 flex items-center gap-1.5 sm:justify-end flex-wrap">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                                  {s.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <Button size="sm" variant={s.isActive ? 'default' : 'outline'} className="h-6 text-[10px] px-2" onClick={() => openBooking(s)} disabled={!s.isActive}>
                                  View
                                </Button>
                                <button type="button" onClick={() => openEditScreening(s)} className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer" title="Edit screening">
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button type="button" onClick={() => handleDeleteScreening(s)} className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer" title="Delete screening">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Locked Seats Tab ── */}
                {activeHallTab === 'locked' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">Locked Seats</h3>
                      <span className="text-[11px] text-muted-foreground">Select a screening to view locked seats</span>
                    </div>

                    {/* Screening selector */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <Select
                          value={selectedScreeningIdForLocked[expandedHallId] ?? ''}
                          onChange={(e) => {
                            const sid = e.target.value ? Number(e.target.value) : '';
                            setSelectedScreeningIdForLocked(prev => ({ ...prev, [expandedHallId]: sid }));
                            if (sid) fetchLockedSeats(sid, expandedHallId);
                          }}
                        >
                          <option value="">— Select a screening —</option>
                          {currentScreenings.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.movieName} · {s.screeningDate} {formatStartTime(s.startTime)}
                            </option>
                          ))}
                        </Select>
                      </div>
                      {selectedScreeningIdForLocked[expandedHallId] && (
                        <button
                          type="button"
                          onClick={() => fetchLockedSeats(selectedScreeningIdForLocked[expandedHallId], expandedHallId)}
                          className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1"
                          disabled={loadingLockedSeats[`${selectedScreeningIdForLocked[expandedHallId]}-${expandedHallId}`]}
                        >
                          <RefreshCw className={`h-3 w-3 ${loadingLockedSeats[`${selectedScreeningIdForLocked[expandedHallId]}-${expandedHallId}`] ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                      )}
                    </div>

                    {/* Locked seats list */}
                    {(() => {
                      const sid = selectedScreeningIdForLocked[expandedHallId];
                      if (!sid) return null;
                      const key = `${sid}-${expandedHallId}`;
                      const byClass = lockedSeats[key];
                      const isLoading = loadingLockedSeats[key];
                      const err = lockedSeatsError[key];
                      if (isLoading) return (
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                        </div>
                      );
                      if (err) return (
                        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                          <p className="text-sm text-destructive">{err}</p>
                        </div>
                      );
                      if (!byClass) return null;
                      const classNames = Object.keys(byClass);
                      const totalLocked = classNames.reduce((sum, c) => sum + (byClass[c]?.length ?? 0), 0);
                      // Build a lookup from seat id → seat object for identifier display
                      const seatById = Object.fromEntries((seats[expandedHallId] ?? []).map(s => [s.id, s]));
                      if (totalLocked === 0) return (
                        <div className="rounded-lg border border-dashed py-14 text-center">
                          <Lock className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">No locked seats for this screening.</p>
                        </div>
                      );
                      return (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{totalLocked}</span> seat{totalLocked !== 1 ? 's' : ''} currently locked
                          </p>
                          {classNames.map(className => {
                            const ids = byClass[className] ?? [];
                            if (ids.length === 0) return null;
                            return (
                              <div key={className} className="rounded-lg border border-border overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-border">
                                  <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">{className}</span>
                                  <span className="ml-auto text-[10px] text-amber-600 dark:text-amber-400 font-medium">{ids.length} seat{ids.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 p-3">
                                  {ids.map(seatId => {
                                    const seat = seatById[seatId];
                                    const seatLabel = seat?.seatIdentifier ?? `#${seatId}`;
                                    return (
                                      <div
                                        key={seatId}
                                        className="flex flex-col rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 overflow-hidden"
                                        title={`Seat ID: ${seatId}`}
                                      >
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                                          <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                                          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">{seatLabel}</span>
                                          {seat?.basePrice != null && (
                                            <span className="text-[10px] text-amber-600 dark:text-amber-400">BTN {seat.basePrice}</span>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => openConfirmModal(sid, seatId, seatLabel)}
                                          className="text-[10px] font-medium text-center py-1 px-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-primary hover:text-primary-foreground transition-colors border-t border-amber-200 dark:border-amber-800 cursor-pointer"
                                        >
                                          Confirm
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── Bookings Tab ── */}
                {activeHallTab === 'bookings' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">Bookings</h3>
                      {bookings[expandedTheaterId] !== undefined && (
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                          {bookings[expandedTheaterId].length}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => fetchBookings(expandedTheaterId)}
                        className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1 ml-1"
                        disabled={loadingBookings[expandedTheaterId]}
                      >
                        <RefreshCw className={`h-3 w-3 ${loadingBookings[expandedTheaterId] ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>

                    {loadingBookings[expandedTheaterId] ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                      </div>
                    ) : bookingsError[expandedTheaterId] ? (
                      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                        <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                        <p className="text-sm text-destructive">{bookingsError[expandedTheaterId]}</p>
                      </div>
                    ) : !bookings[expandedTheaterId] ? (
                      <div className="rounded-lg border border-dashed py-14 text-center">
                        <Ticket className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">Click Refresh to load bookings.</p>
                      </div>
                    ) : bookings[expandedTheaterId].length === 0 ? (
                      <div className="rounded-lg border border-dashed py-14 text-center">
                        <Ticket className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No bookings for this theater.</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="hidden sm:grid sm:grid-cols-[100px_80px_1fr_110px_auto] items-center gap-3 px-4 py-2 bg-muted/40 border-b border-border">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ticket</span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Seat</span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Customer</span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Booked At</span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</span>
                        </div>
                        <div className="divide-y divide-border">
                          {bookings[expandedTheaterId].map((b, i) => (
                            <div key={b.ticketNumber ?? i} className="flex flex-col sm:grid sm:grid-cols-[100px_80px_1fr_110px_auto] items-start sm:items-center gap-2 sm:gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                              <span className="font-mono text-xs font-semibold text-foreground truncate">{b.ticketNumber ?? '—'}</span>
                              <div className="text-xs">
                                <span className="font-medium text-foreground">{b.seatIdentifier ?? '—'}</span>
                                {b.seatClass && (
                                  <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground px-1 py-0.5 rounded">{b.seatClass}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{b.customerName ?? '—'}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{b.email ?? ''}{b.phoneNumber ? ` · ${b.phoneNumber}` : ''}</p>
                              </div>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {b.bookedAt ? new Date(b.bookedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {b.ticketNumber && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive whitespace-nowrap"
                                    onClick={() => handleCancelTicket(b.ticketNumber)}
                                  >
                                    <X className="h-3 w-3 mr-1" /> Cancel Ticket
                                  </Button>
                                )}
                                {b.bookingRef && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive whitespace-nowrap"
                                    onClick={() => handleCancelBooking(b.bookingRef)}
                                  >
                                    <X className="h-3 w-3 mr-1" /> Cancel Booking
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Seat Layout Tab ── */}
                {activeHallTab === 'seats' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Armchair className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">Seat Layout</h3>
                      {seats[expandedHallId] !== undefined && (
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                          {currentSeats.length} seats
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant={showSeatConfigForm[expandedHallId] ? 'secondary' : 'outline'}
                        className="ml-auto h-7 gap-1.5 text-xs px-3"
                        onClick={() => handleToggleSeatConfigForm(expandedHallId)}
                      >
                        <Settings className="h-3 w-3" />
                        {showSeatConfigForm[expandedHallId] ? 'Cancel Config' : 'Configure Seats'}
                      </Button>
                    </div>

                    {/* Seat config form */}
                    {showSeatConfigForm[expandedHallId] && (
                      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                        <div className="text-xs text-muted-foreground">
                          Current seats (from API): <strong>{currentSeats.length}</strong>
                          {' · '}
                          New config total: <strong>{(seatConfigRows[expandedHallId] || []).reduce((sum, row) => sum + (parseInt(row.seatCount, 10) || 0), 0)}</strong> / {MAX_SEATS_PER_HALL} max
                        </div>
                        {(seatConfigRows[expandedHallId] || []).reduce((sum, row) => sum + (parseInt(row.seatCount, 10) || 0), 0) > MAX_SEATS_PER_HALL && (
                          <p className="text-xs text-destructive font-medium">New layout exceeds {MAX_SEATS_PER_HALL} seats.</p>
                        )}
                        {seatConfigErrors[expandedHallId]?.general && (
                          <p className="text-xs text-destructive" role="alert">{seatConfigErrors[expandedHallId].general}</p>
                        )}
                        <form onSubmit={(e) => handleSeatConfigSubmit(e, expandedHallId)} className="space-y-2">
                          {(seatConfigRows[expandedHallId] || []).map((row, idx) => (
                            <div key={idx} id={`seat-config-${expandedHallId}-row-${idx}`} className="flex flex-wrap gap-2 items-end p-3 rounded-lg border border-border bg-muted/20">
                              <div className="w-16 space-y-1">
                                <Label className="text-[9px] uppercase tracking-wide">Row</Label>
                                <Input value={row.rowName} onChange={(e) => handleSeatConfigRowChange(expandedHallId, idx, 'rowName', e.target.value)} className={`h-7 text-xs px-2 ${seatConfigErrors[expandedHallId]?.[idx]?.rowName ? 'border-destructive' : ''}`} />
                              </div>
                              <div className="w-16 space-y-1">
                                <Label className="text-[9px] uppercase tracking-wide">Count</Label>
                                <Input type="number" value={row.seatCount} onChange={(e) => handleSeatConfigRowChange(expandedHallId, idx, 'seatCount', e.target.value)} className={`h-7 text-xs px-2 ${seatConfigErrors[expandedHallId]?.[idx]?.seatCount ? 'border-destructive' : ''}`} />
                              </div>
                              <div className="flex-1 min-w-[90px] space-y-1">
                                <Label className="text-[9px] uppercase tracking-wide">Class</Label>
                                <Select value={row.seatClassId} onChange={(e) => handleSeatConfigRowChange(expandedHallId, idx, 'seatClassId', e.target.value)} className={`h-7 text-xs py-0 px-2 ${seatConfigErrors[expandedHallId]?.[idx]?.seatClassId ? 'border-destructive' : ''}`}>
                                  <option value="">Select…</option>
                                  {seatClasses.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                </Select>
                              </div>
                              <div className="flex-1 min-w-[90px] space-y-1">
                                <Label className="text-[9px] uppercase tracking-wide">Status</Label>
                                <Select value={row.seatStatusId} onChange={(e) => handleSeatConfigRowChange(expandedHallId, idx, 'seatStatusId', e.target.value)} className={`h-7 text-xs py-0 px-2 ${seatConfigErrors[expandedHallId]?.[idx]?.seatStatusId ? 'border-destructive' : ''}`}>
                                  <option value="">Select…</option>
                                  {seatStatuses.map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
                                </Select>
                              </div>
                              <div className="w-20 space-y-1">
                                <Label className="text-[9px] uppercase tracking-wide">Price</Label>
                                <Input type="number" value={row.basePrice} onChange={(e) => handleSeatConfigRowChange(expandedHallId, idx, 'basePrice', e.target.value)} className={`h-7 text-xs px-2 ${seatConfigErrors[expandedHallId]?.[idx]?.basePrice ? 'border-destructive' : ''}`} />
                              </div>
                              {idx > 0 && (
                                <button type="button" onClick={() => handleRemoveSeatConfigRow(expandedHallId, idx)} className="h-7 w-7 flex items-center justify-center rounded text-destructive hover:bg-destructive/10 transition-colors cursor-pointer" title="Remove row">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <div className="flex justify-between pt-1">
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleAddSeatConfigRow(expandedHallId)} className="h-7 gap-1 text-xs">
                              <Plus className="h-3 w-3" /> Add Row
                            </Button>
                            <Button type="submit" size="sm" className="h-7 text-xs" disabled={isSubmittingSeatConfig[expandedHallId]}>
                              {isSubmittingSeatConfig[expandedHallId] ? 'Saving…' : 'Save Layout'}
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Seat map preview */}
                    {!showSeatConfigForm[expandedHallId] && (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-b border-border">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Seat Map Preview</span>
                          {loadingSeats[expandedHallId] && <RefreshCw className="h-2.5 w-2.5 animate-spin text-muted-foreground ml-auto" />}
                        </div>
                        <div className="p-4 max-h-80 overflow-y-auto">
                          {loadingSeats[expandedHallId] ? (
                            <div className="space-y-2">
                              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                          ) : seatsError[expandedHallId] ? (
                            <div className="flex items-center gap-2 text-sm text-destructive py-2">
                              <AlertCircle className="h-4 w-4 shrink-0" /> {seatsError[expandedHallId]}
                            </div>
                          ) : currentSeats.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">No seats configured. Use "Configure Seats" to set up the layout.</p>
                          ) : (
                            <div className="space-y-3">
                              {(() => {
                                const byRow = currentSeats.reduce((acc, seat) => {
                                  const r = seat.rowName ?? '';
                                  if (!acc[r]) acc[r] = [];
                                  acc[r].push(seat);
                                  return acc;
                                }, {});
                                const rowNames = Object.keys(byRow).sort((a, b) => {
                                  const na = parseInt(a, 10); const nb = parseInt(b, 10);
                                  if (!isNaN(na) && !isNaN(nb)) return na - nb;
                                  return String(a).localeCompare(String(b));
                                });
                                return rowNames.map(rowName => (
                                  <div key={rowName} className="space-y-1">
                                    <div className="text-[10px] font-semibold text-muted-foreground">Row {rowName}</div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {byRow[rowName].map(seat => (
                                        <div
                                          key={seat.id}
                                          className={cn(
                                            'min-w-[4rem] rounded border px-1.5 py-1 text-[9px]',
                                            seat.isBlocked
                                              ? 'border-red-300 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                                              : 'border-green-300 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400'
                                          )}
                                          title={seat.seatIdentifier || `${seat.rowName}${seat.seatNumber}`}
                                        >
                                          <div className="font-semibold truncate">{seat.seatIdentifier ?? `${seat.rowName}${seat.seatNumber}`}</div>
                                          <div className="text-muted-foreground truncate">{seat.seatClassName ?? '—'}</div>
                                          <div className="font-medium">BTN {seat.basePrice != null ? Number(seat.basePrice) : '—'}</div>
                                          <div className="text-[8px] opacity-80">{seat.isBlocked ? 'Blocked' : 'Available'}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AddMoviePage;
