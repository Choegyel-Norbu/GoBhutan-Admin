import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Bus, Plus, Edit, Trash2, Search, Filter, Eye, Clock, MapPin, Calendar, ArrowLeft, Sparkles, Ticket } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/apiService';
import Swal from 'sweetalert2';

function BusDetailsPage() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingRoute, setSubmittingRoute] = useState(false);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const routeFormRef = useRef(null);
  const scheduleFormRef = useRef(null);
  const generateScheduleFormRef = useRef(null);
  const schedulesSectionRefs = useRef({}); // Refs for each route's schedules section
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [viewingRouteSchedules, setViewingRouteSchedules] = useState(null); // Track which route's schedules are being viewed
  const [routeSchedules, setRouteSchedules] = useState({}); // Store schedules for each route
  const [loadingRouteSchedules, setLoadingRouteSchedules] = useState({}); // Track loading state per route
  const [showGenerateScheduleForm, setShowGenerateScheduleForm] = useState(false);
  const [generatingSchedules, setGeneratingSchedules] = useState(false);
  
  // Booking state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedScheduleForBooking, setSelectedScheduleForBooking] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const bookingFormRef = useRef(null);
  
  // Booking form data
  const [bookingFormData, setBookingFormData] = useState({
    scheduleId: '',
    seatNumbers: [],
    seatLabels: [],
    applicantCid: '',
    applicantMobile: '',
    applicantEmail: '',
    status: 'PENDING'
  });
  
  // Generate schedule form data
  const [generateScheduleData, setGenerateScheduleData] = useState({
    startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    days: 1
  });

  // Route form data
  const [routeFormData, setRouteFormData] = useState({
    source: '',
    destination: '',
    distance: '',
    baseFare: '',
    estimatedDuration: '',
    departureTime: '',
    customFare: '',
    active: true
  });

  // Schedule form data
  const [scheduleFormData, setScheduleFormData] = useState({
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    price: ''
  });

  const [errors, setErrors] = useState({});
  const hasLoadedRef = useRef(false);

  // Load routes on component mount
  useEffect(() => {
    if (busId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadRoutes();
    }
    
    // Reset the ref when component unmounts or busId changes
    return () => {
      hasLoadedRef.current = false;
    };
  }, [busId]);

  const loadRoutes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Load bus details using /api/buses/bus/{busId} endpoint
      const busResponse = await api.bus.getBus(parseInt(busId));
      
      console.log('Bus API Response:', busResponse); // Debug log
      
      // Extract bus data from response structure: { success, message, data }
      const busData = busResponse?.data || busResponse;
      
      // Use bus data from API response, navigation state, or create minimal bus object
      const busFromState = location.state?.bus;
      const currentBus = busData || busFromState || {
        id: parseInt(busId),
        busNumber: `BT-${busId.toString().padStart(3, '0')}`,
        busType: 'Standard',
        totalSeats: 50,
        description: 'Bus details loaded from routes and schedules',
        amenities: 'AC, WiFi, Water',
        status: 'active',
        layoutType: '1+2'
      };
      
      // Extract seats if available
      if (busData?.seats && Array.isArray(busData.seats)) {
        setSeats(busData.seats);
      } else {
        setSeats([]);
      }
      
      setBus(currentBus);
      
      // Load routes for this bus using /api/bus-routes/bus/{busId}
      const routesResponse = await api.bus.getRoutes(parseInt(busId));
      
      console.log('Routes API Response:', routesResponse); // Debug log
      
      // Ensure arrays
      const routesData = Array.isArray(routesResponse) ? routesResponse : 
                        routesResponse?.data ? routesResponse.data : 
                        routesResponse?.routes ? routesResponse.routes : [];
      
      console.log('Parsed routes data:', routesData); // Debug log
      
      // Filter valid routes for this bus
      const busRoutes = routesData.filter(route => route && route.id);
      
      setRoutes(busRoutes);
    } catch (error) {
      console.error('Error loading routes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load routes.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const handleRouteInputChange = (field, value) => {
    setRouteFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleScheduleInputChange = (field, value) => {
    console.log('Schedule input change:', field, value); // Debug log
    setScheduleFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('New schedule form data:', newData); // Debug log
      return newData;
    });

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-calculate arrival time if departure time and route duration are available
    if (field === 'departureTime' && scheduleFormData.routeId) {
      const selectedRoute = routes.find(r => r && r.id === parseInt(scheduleFormData.routeId));
      if (selectedRoute && value) {
        const departure = new Date(value);
        const arrival = new Date(departure.getTime() + (selectedRoute.estimatedDuration * 60000));
        setScheduleFormData(prev => ({
          ...prev,
          arrivalTime: arrival.toISOString().slice(0, 16)
        }));
      }
    }

    // Auto-calculate price if route is selected
    if (field === 'routeId' && value) {
      const selectedRoute = routes.find(r => r && r.id === parseInt(value));
      if (selectedRoute) {
        setScheduleFormData(prev => ({
          ...prev,
          price: selectedRoute.baseFare.toString()
        }));
      }
    }
  };

  const validateRouteForm = () => {
    const newErrors = {};

    if (!routeFormData.source.trim()) {
      newErrors.source = 'Source is required';
    }
    if (!routeFormData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (routeFormData.source === routeFormData.destination) {
      newErrors.destination = 'Destination must be different from source';
    }
    if (!routeFormData.distance || parseFloat(routeFormData.distance) <= 0) {
      newErrors.distance = 'Distance must be greater than 0';
    }
    if (!routeFormData.baseFare || parseFloat(routeFormData.baseFare) <= 0) {
      newErrors.baseFare = 'Base fare must be greater than 0';
    }
    if (!routeFormData.estimatedDuration || parseInt(routeFormData.estimatedDuration) <= 0) {
      newErrors.estimatedDuration = 'Estimated duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateScheduleForm = () => {
    const newErrors = {};

    if (!scheduleFormData.routeId) {
      newErrors.routeId = 'Route is required';
    }
    if (!scheduleFormData.departureTime) {
      newErrors.departureTime = 'Departure time is required';
    }
    if (!scheduleFormData.arrivalTime) {
      newErrors.arrivalTime = 'Arrival time is required';
    }
    if (!scheduleFormData.price || parseFloat(scheduleFormData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (scheduleFormData.departureTime && scheduleFormData.arrivalTime) {
      const departure = new Date(scheduleFormData.departureTime);
      const arrival = new Date(scheduleFormData.arrivalTime);
      if (arrival <= departure) {
        newErrors.arrivalTime = 'Arrival time must be after departure time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRouteForm()) {
      return;
    }

    if (submittingRoute) return; // Prevent double submission

    try {
      setSubmittingRoute(true);
      const payload = {
        busId: parseInt(busId),
        source: routeFormData.source.trim(),
        destination: routeFormData.destination.trim(),
        distance: parseFloat(routeFormData.distance),
        baseFare: parseFloat(routeFormData.baseFare),
        estimatedDuration: parseInt(routeFormData.estimatedDuration),
        departureTime: routeFormData.departureTime || '10:30',
        customFare: routeFormData.customFare ? parseFloat(routeFormData.customFare) : 0,
        active: routeFormData.active !== undefined ? routeFormData.active : true
      };

      if (editingRoute) {
        await api.bus.updateRoute(editingRoute.id, payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Route updated successfully.',
          confirmButtonText: 'OK'
        });
      } else {
        await api.bus.createRoute(payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Route created successfully.',
          confirmButtonText: 'OK'
        });
      }

      resetRouteForm();
      await loadRoutes(true);
    } catch (error) {
      console.error('Error saving route:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save route. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmittingRoute(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateScheduleForm()) {
      return;
    }

    if (submittingSchedule) return; // Prevent double submission

    try {
      setSubmittingSchedule(true);
      const payload = {
        busId: parseInt(busId),
        routeId: parseInt(scheduleFormData.routeId),
        departureTime: new Date(scheduleFormData.departureTime).toISOString().slice(0, 19).replace('T', ' '),
        arrivalTime: new Date(scheduleFormData.arrivalTime).toISOString().slice(0, 19).replace('T', ' '),
        price: parseFloat(scheduleFormData.price)
      };

      console.log('Schedule payload:', payload); // Debug log

      if (editingSchedule) {
        await api.bus.updateSchedule(editingSchedule.id, payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Schedule updated successfully.',
          confirmButtonText: 'OK'
        });
      } else {
        await api.bus.createSchedule(payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Schedule created successfully.',
          confirmButtonText: 'OK'
        });
      }

      const savedRouteId = scheduleFormData.routeId;
      resetScheduleForm();
      
      // Refresh the route schedules if we're viewing schedules for this route
      if (savedRouteId && viewingRouteSchedules === parseInt(savedRouteId)) {
        // Clear the cache and reload
        setRouteSchedules(prev => {
          const newSchedules = { ...prev };
          delete newSchedules[parseInt(savedRouteId)];
          return newSchedules;
        });
        await loadSchedulesForRoute(parseInt(savedRouteId));
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save schedule. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const resetRouteForm = () => {
    setRouteFormData({
      source: '',
      destination: '',
      distance: '',
      baseFare: '',
      estimatedDuration: '',
      departureTime: '',
      customFare: '',
      active: true
    });
    setErrors({});
    setShowAddRouteForm(false);
    setEditingRoute(null);
  };

  const scrollToRouteForm = () => {
    setTimeout(() => {
      if (routeFormRef.current) {
        routeFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const resetScheduleForm = () => {
    setScheduleFormData({
      routeId: '',
      departureTime: '',
      arrivalTime: '',
      price: ''
    });
    setErrors({});
    setShowAddScheduleForm(false);
    setEditingSchedule(null);
  };

  const scrollToScheduleForm = () => {
    setTimeout(() => {
      if (scheduleFormRef.current) {
        scheduleFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const scrollToGenerateScheduleForm = () => {
    setTimeout(() => {
      if (generateScheduleFormRef.current) {
        generateScheduleFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const scrollToBookingForm = () => {
    setTimeout(() => {
      if (bookingFormRef.current) {
        bookingFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleBookSchedule = async (schedule) => {
    try {
      setSelectedScheduleForBooking(schedule);
      setLoadingSeats(true);
      setSelectedSeats([]);
      
      // First, use bus seats if available, otherwise fetch available seats for this schedule
      let seatsData = [];
      
      if (seats && seats.length > 0) {
        // Use bus seats we already have
        seatsData = seats;
        console.log('Using bus seats:', seatsData);
      } else {
        // Fetch available seats for this schedule
        const seatsResponse = await api.bus.getAvailableSeats(schedule.id);
        console.log('Available seats response:', seatsResponse);
        
        // Extract seats data
        seatsData = Array.isArray(seatsResponse) ? seatsResponse : 
                     seatsResponse?.data ? seatsResponse.data : 
                     seatsResponse?.seats ? seatsResponse.seats : [];
      }
      
      setAvailableSeats(seatsData);
      
      // Reset booking form with schedule ID
      setBookingFormData({
        scheduleId: schedule.id.toString(),
        seatNumbers: [],
        seatLabels: [],
        applicantCid: '',
        applicantMobile: '',
        applicantEmail: '',
        status: 'PENDING'
      });
      
      setShowBookingForm(true);
      scrollToBookingForm();
    } catch (error) {
      console.error('Error loading seats:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load seats. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSeatToggle = (seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      if (isSelected) {
        // Remove seat
        const newSeats = prev.filter(s => s.id !== seat.id);
        // Auto-update seatNumbers and seatLabels
        setBookingFormData(prevData => ({
          ...prevData,
          seatNumbers: newSeats.map(s => s.startNo || s.seatNumber || s.id),
          seatLabels: newSeats.map(s => s.seatLabel || s.label || `Seat ${s.id}`)
        }));
        return newSeats;
      } else {
        // Add seat
        const newSeats = [...prev, seat];
        // Auto-update seatNumbers and seatLabels
        setBookingFormData(prevData => ({
          ...prevData,
          seatNumbers: newSeats.map(s => s.startNo || s.seatNumber || s.id),
          seatLabels: newSeats.map(s => s.seatLabel || s.label || `Seat ${s.id}`)
        }));
        return newSeats;
      }
    });
  };

  const handleBookingInputChange = (field, value) => {
    setBookingFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateBookingForm = () => {
    if (selectedSeats.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select at least one seat.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    if (!bookingFormData.applicantCid.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'CID is required.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    if (!bookingFormData.applicantMobile.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Mobile number is required.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    if (!bookingFormData.applicantEmail.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Email is required.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    return true;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBookingForm()) {
      return;
    }

    if (submittingBooking) return;

    try {
      setSubmittingBooking(true);
      
      const payload = {
        scheduleId: parseInt(bookingFormData.scheduleId) || selectedScheduleForBooking.id,
        seatNumbers: bookingFormData.seatNumbers.length > 0 ? bookingFormData.seatNumbers : selectedSeats.map(seat => seat.startNo || seat.seatNumber || seat.id),
        seatLabels: bookingFormData.seatLabels.length > 0 ? bookingFormData.seatLabels : selectedSeats.map(seat => seat.seatLabel || seat.label || `Seat ${seat.id}`),
        applicantCid: bookingFormData.applicantCid.trim(),
        applicantMobile: bookingFormData.applicantMobile.trim(),
        applicantEmail: bookingFormData.applicantEmail.trim(),
        status: bookingFormData.status || 'PENDING'
      };

      console.log('Booking payload:', payload);
      
      await api.bus.lockBooking(payload);
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Booking confirmed for ${selectedSeats.length} seat(s).`,
        confirmButtonText: 'OK'
      });

      // Reset form
      setBookingFormData({
        scheduleId: '',
        seatNumbers: [],
        seatLabels: [],
        applicantCid: '',
        applicantMobile: '',
        applicantEmail: '',
        status: 'PENDING'
      });
      setSelectedSeats([]);
      setShowBookingForm(false);
      setSelectedScheduleForBooking(null);
      
      // Refresh schedules to update available seats
      if (selectedScheduleForBooking?.routeId) {
        const routeId = selectedScheduleForBooking.routeId;
        setRouteSchedules(prev => {
          const newSchedules = { ...prev };
          delete newSchedules[routeId];
          return newSchedules;
        });
        await loadSchedulesForRoute(routeId);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Failed to create booking. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setRouteFormData({
      source: route.source || '',
      destination: route.destination || '',
      distance: route.distance?.toString() || '',
      baseFare: route.baseFare?.toString() || '',
      estimatedDuration: route.estimatedDuration?.toString() || '',
      departureTime: route.departureTime || '',
      customFare: route.customFare?.toString() || '',
      active: route.active !== undefined ? route.active : true
    });
    setShowAddRouteForm(true);
    scrollToRouteForm();
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleFormData({
      routeId: schedule.routeId?.toString() || '',
      departureTime: schedule.departureTime ? new Date(schedule.departureTime).toISOString().slice(0, 16) : '',
      arrivalTime: schedule.arrivalTime ? new Date(schedule.arrivalTime).toISOString().slice(0, 16) : '',
      price: schedule.price?.toString() || ''
    });
    setShowAddScheduleForm(true);
    scrollToScheduleForm();
  };


  const handleDeleteRoute = async (route) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the route from ${route.source} to ${route.destination}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.bus.deleteRoute(route.id);
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Route has been deleted.',
          confirmButtonText: 'OK'
        });
        await loadRoutes(true);
      } catch (error) {
        console.error('Error deleting route:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete route. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleDeleteSchedule = async (schedule) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete this schedule.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.bus.deleteSchedule(schedule.id);
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Schedule has been deleted.',
          confirmButtonText: 'OK'
        });
        
        // Refresh the route schedules if we're viewing schedules for this route
        if (schedule.routeId && viewingRouteSchedules === schedule.routeId) {
          // Clear the cache and reload
          setRouteSchedules(prev => {
            const newSchedules = { ...prev };
            delete newSchedules[schedule.routeId];
            return newSchedules;
          });
          await loadSchedulesForRoute(schedule.routeId);
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete schedule. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScheduleStatus = (departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffHours = (departure - now) / (1000 * 60 * 60);
    
    if (diffHours < 0) return { status: 'departed', variant: 'outline' };
    if (diffHours < 1) return { status: 'boarding', variant: 'secondary' };
    if (diffHours < 24) return { status: 'today', variant: 'default' };
    return { status: 'upcoming', variant: 'outline' };
  };

  const handleGenerateSchedules = async (e) => {
    e.preventDefault();
    
    console.log('handleGenerateSchedules called', { generateScheduleData, busId }); // Debug log
    
    if (generatingSchedules) {
      console.log('Already generating schedules, returning early');
      return; // Prevent double submission
    }

    // Validate form
    if (!generateScheduleData.startDate) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Start date is required.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!generateScheduleData.days || parseInt(generateScheduleData.days) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Days must be greater than 0.',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setGeneratingSchedules(true);
      const payload = {
        busId: parseInt(busId),
        startDate: generateScheduleData.startDate,
        days: parseInt(generateScheduleData.days)
      };

      console.log('Calling API with payload:', payload); // Debug log
      const response = await api.bus.generateSchedules(payload);
      console.log('API Response:', response); // Debug log
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Schedules generated successfully for ${generateScheduleData.days} day(s) starting from ${generateScheduleData.startDate}.`,
        confirmButtonText: 'OK'
      });

      // Reset form
      setGenerateScheduleData({
        startDate: new Date().toISOString().split('T')[0],
        days: 1
      });
      setShowGenerateScheduleForm(false);
      
      // Optionally refresh routes to see new schedules
      // await loadRoutes(true);
    } catch (error) {
      console.error('Error generating schedules:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status
      });
      
      let errorMessage = 'Failed to generate schedules. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    } finally {
      setGeneratingSchedules(false);
    }
  };

  const loadSchedulesForRoute = async (routeId) => {
    // If already viewing this route's schedules, hide them
    if (viewingRouteSchedules === routeId) {
      setViewingRouteSchedules(null);
      return;
    }

    // If schedules are already loaded, just show them
    if (routeSchedules[routeId]) {
      setViewingRouteSchedules(routeId);
      // Scroll to schedules section after a brief delay to ensure DOM is updated
      setTimeout(() => {
        const schedulesRef = schedulesSectionRefs.current[routeId];
        if (schedulesRef) {
          schedulesRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }

    try {
      setLoadingRouteSchedules(prev => ({ ...prev, [routeId]: true }));
      const response = await api.bus.getSchedulesByRoute(routeId);
      
      // Ensure arrays
      const schedulesData = Array.isArray(response) ? response : 
                           response?.data ? response.data : 
                           response?.schedules ? response.schedules : [];
      
      // Store schedules for this route
      setRouteSchedules(prev => ({
        ...prev,
        [routeId]: schedulesData.filter(schedule => schedule && schedule.id)
      }));
      
      setViewingRouteSchedules(routeId);
      
      // Scroll to schedules section after a brief delay to ensure DOM is updated
      setTimeout(() => {
        const schedulesRef = schedulesSectionRefs.current[routeId];
        if (schedulesRef) {
          schedulesRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error loading schedules for route:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load schedules for this route.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingRouteSchedules(prev => ({ ...prev, [routeId]: false }));
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Bus Details" description="Loading bus details...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bus details...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!bus) {
    return (
      <PageWrapper title="Bus Not Found" description="The requested bus could not be found.">
        <div className="text-center py-12">
          <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Bus Not Found</h3>
          <p className="text-muted-foreground mb-4">The requested bus could not be found.</p>
          <Button onClick={() => navigate('/dashboard/bus/manage')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bus Management
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title={`${bus.busNumber || `Bus ${bus.id}`}`}
      description="Manage routes and schedules for this bus."
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/bus/manage')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bus Management
          </Button>
        </div>

        {/* Bus Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  Bus Information
                </CardTitle>
                <CardDescription>
                  Details and specifications for this bus.
                </CardDescription>
              </div>
              <Button 
                onClick={() => {
                  setShowGenerateScheduleForm(true);
                  scrollToGenerateScheduleForm();
                }}
                disabled={routes.length < 1}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Schedules
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bus Number</p>
                <p className="text-lg font-semibold">{bus.busNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bus Type</p>
                <p className="text-lg font-semibold">{bus.busType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Seats</p>
                <p className="text-lg font-semibold">{bus.totalSeats || seats.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Layout Type</p>
                <p className="text-lg font-semibold">{bus.layoutType || 'N/A'}</p>
              </div>
            </div>
            {bus.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{bus.description}</p>
              </div>
            )}
            {bus.amenities && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Amenities</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {typeof bus.amenities === 'string' 
                    ? bus.amenities.split(',').map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity.trim()}
                        </Badge>
                      ))
                    : <Badge variant="outline" className="text-xs">{bus.amenities}</Badge>
                  }
                </div>
              </div>
            )}
            {seats.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-muted-foreground mb-3">Seats ({seats.length} seats)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-3 bg-muted/30 rounded-lg">
                  {seats.map((seat) => (
                    <div 
                      key={seat.id} 
                      className="p-2 border rounded text-center text-xs bg-background hover:bg-muted transition-colors"
                      title={`Seat ${seat.seatLabel} - ${seat.seatType}`}
                    >
                      <div className="font-semibold">{seat.seatNumber || seat.startNo || seat.id} <span className="text-muted-foreground">({seat.seatLabel})</span></div>
                      <div className="text-md mt-1">
                        
                      </div>
                      <div className="text-muted-foreground text-[10px] mt-1">
                        {seat.seatType.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Routes</CardTitle>
                <CardDescription>
                  Manage routes and schedules for this bus.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button onClick={() => {
                    setShowAddRouteForm(true);
                    scrollToRouteForm();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Route
                  </Button>
                </div>
                
                {refreshing ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Updating routes...</p>
                  </div>
                ) : routes.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No routes found</h3>
                    <p className="text-muted-foreground mb-4">Add routes for this bus to get started.</p>
                    <Button onClick={() => {
                      setShowAddRouteForm(true);
                      scrollToRouteForm();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Route
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {routes.map((route) => (
                      <div key={route.id} className="space-y-4">
                        <Card className="border">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="text-lg font-semibold">
                                    {route.source} → {route.destination}
                                  </h4>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Distance</p>
                                    <p className="font-medium">{route.distance} km</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Base Fare</p>
                                    <p className="font-medium">BTN {route.baseFare}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Duration</p>
                                    <p className="font-medium">{route.estimatedDuration} hours</p>
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => loadSchedulesForRoute(route.id)}
                                      disabled={loadingRouteSchedules[route.id]}
                                      className="w-full"
                                    >
                                      {loadingRouteSchedules[route.id] ? (
                                        <>
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                                          Loading...
                                        </>
                                      ) : viewingRouteSchedules === route.id ? (
                                        <>
                                          <Eye className="h-4 w-4 mr-2" />
                                          Hide Schedules
                                        </>
                                      ) : (
                                        <>
                                          <Calendar className="h-4 w-4 mr-2" />
                                          View Schedules
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Additional Route Information */}
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Route Details:</span>
                                  </div>
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">From:</span>
                                      <span className="ml-2 font-medium">{route.source}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">To:</span>
                                      <span className="ml-2 font-medium">{route.destination}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Total Distance:</span>
                                      <span className="ml-2 font-medium">{route.distance} kilometers</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Travel Time:</span>
                                      <span className="ml-2 font-medium">{route.estimatedDuration} hours</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <div className="relative group">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditRoute(route)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 w-max max-w-xs">
                                    Edit Route
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                                <div className="relative group">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteRoute(route)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 w-max max-w-xs">
                                    Delete Route
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Route Schedules Display */}
                        {viewingRouteSchedules === route.id && (
                          <Card 
                            ref={(el) => {
                              if (el) {
                                schedulesSectionRefs.current[route.id] = el;
                              }
                            }}
                            className="border-l-4 border-l-primary mt-4"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-md font-semibold flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Schedules for {route.source} → {route.destination}
                                </h5>
                              </div>
                              
                              {loadingRouteSchedules[route.id] ? (
                                <div className="text-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                  <p className="text-muted-foreground">Loading schedules...</p>
                                </div>
                              ) : routeSchedules[route.id] && routeSchedules[route.id].length > 0 ? (
                                <div className="space-y-3">
                                  {routeSchedules[route.id].map((schedule) => {
                                    const status = getScheduleStatus(schedule.departureTime);
                                    return (
                                      <Card key={schedule.id} className="border">
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-start">
                                            <div className="space-y-2 flex-1">
                                              <div className="flex items-center gap-3">
                                                <Badge variant={status.variant}>{status.status}</Badge>
                                              </div>
                                              
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                  <p className="text-muted-foreground">Departure</p>
                                                  <p className="font-medium">{formatTime(schedule.departureTime)}</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Arrival</p>
                                                  <p className="font-medium">{formatTime(schedule.arrivalTime)}</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Price</p>
                                                  <p className="font-medium">BTN {schedule.price}</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Available Seats</p>
                                                  <p className="font-medium">{schedule.availableSeats || 'N/A'}</p>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="flex gap-2 ml-4">
                                              <div className="relative group">
                                                <Button
                                                  variant="default"
                                                  size="sm"
                                                  onClick={() => handleBookSchedule(schedule)}
                                                  disabled={loadingSeats}
                                                >
                                                  <Ticket className="h-4 w-4 mr-1" />
                                                  Book
                                                </Button>
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 w-max max-w-xs">
                                                  Book Seats
                                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                              </div>
                                              <div className="relative group">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleEditSchedule(schedule)}
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 w-max max-w-xs">
                                                  Edit Schedule
                                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                              </div>
                                              <div className="relative group">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleDeleteSchedule(schedule)}
                                                  className="text-red-600 hover:text-red-700"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 w-max max-w-xs">
                                                  Delete Schedule
                                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                  <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
                                  <p className="text-muted-foreground mb-4">No schedules have been created for this route yet.</p>
                                  <Button 
                                    onClick={() => {
                                      setScheduleFormData(prev => ({ ...prev, routeId: route.id.toString() }));
                                      setShowAddScheduleForm(true);
                                      scrollToScheduleForm();
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Schedule
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </CardContent>
        </Card>

        {/* Add/Edit Route Form */}
        {showAddRouteForm && (
          <Card ref={routeFormRef}>
            <CardHeader>
              <CardTitle>
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </CardTitle>
              <CardDescription>
                {editingRoute 
                  ? 'Update the route details below.'
                  : 'Enter the details for the new route.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRouteSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="source">Source *</Label>
                    <Input
                      id="source"
                      value={routeFormData.source}
                      onChange={(e) => handleRouteInputChange('source', e.target.value)}
                      placeholder="e.g., Thimphu"
                    />
                    {errors.source && (
                      <p className="text-sm text-red-600">{errors.source}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      value={routeFormData.destination}
                      onChange={(e) => handleRouteInputChange('destination', e.target.value)}
                      placeholder="e.g., Paro"
                    />
                    {errors.destination && (
                      <p className="text-sm text-red-600">{errors.destination}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km) *</Label>
                    <Input
                      id="distance"
                      type="number"
                      step="0.1"
                      value={routeFormData.distance}
                      onChange={(e) => handleRouteInputChange('distance', e.target.value)}
                      placeholder="e.g., 65.5"
                    />
                    {errors.distance && (
                      <p className="text-sm text-red-600">{errors.distance}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baseFare">Base Fare (BTN) *</Label>
                    <Input
                      id="baseFare"
                      type="number"
                      step="0.01"
                      value={routeFormData.baseFare}
                      onChange={(e) => handleRouteInputChange('baseFare', e.target.value)}
                      placeholder="e.g., 150.00"
                    />
                    {errors.baseFare && (
                      <p className="text-sm text-red-600">{errors.baseFare}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Estimated Duration (min) *</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      value={routeFormData.estimatedDuration}
                      onChange={(e) => handleRouteInputChange('estimatedDuration', e.target.value)}
                      placeholder="e.g., 90"
                    />
                    {errors.estimatedDuration && (
                      <p className="text-sm text-red-600">{errors.estimatedDuration}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Departure Time</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      value={routeFormData.departureTime}
                      onChange={(e) => handleRouteInputChange('departureTime', e.target.value)}
                      placeholder="e.g., 10:30"
                    />
                    <p className="text-sm text-muted-foreground">
                      Default departure time for this route (format: HH:MM)
                    </p>
                    {errors.departureTime && (
                      <p className="text-sm text-red-600">{errors.departureTime}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customFare">Custom Fare (BTN)</Label>
                    <Input
                      id="customFare"
                      type="number"
                      step="0.01"
                      value={routeFormData.customFare}
                      onChange={(e) => handleRouteInputChange('customFare', e.target.value)}
                      placeholder="e.g., 200.00"
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional custom fare override (leave empty to use base fare)
                    </p>
                    {errors.customFare && (
                      <p className="text-sm text-red-600">{errors.customFare}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="active"
                        checked={routeFormData.active}
                        onChange={(e) => handleRouteInputChange('active', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="active" className="cursor-pointer">
                        Active Route
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Whether this route is currently active and available for booking
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={submittingRoute}>
                    {submittingRoute ? 'Saving...' : (editingRoute ? 'Update Route' : 'Add Route')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetRouteForm} disabled={submittingRoute}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Schedule Form */}
        {showAddScheduleForm && (
          <Card ref={scheduleFormRef}>
            <CardHeader>
              <CardTitle>
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </CardTitle>
              <CardDescription>
                {editingSchedule 
                  ? 'Update the schedule details below.'
                  : 'Enter the details for the new schedule.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="routeId">Route *</Label>
                    <Select
                      value={scheduleFormData.routeId}
                      onChange={(e) => handleScheduleInputChange('routeId', e.target.value)}
                      disabled={!!scheduleFormData.routeId && !editingSchedule}
                    >
                      <option value="">Select a route</option>
                      {Array.isArray(routes) ? routes.map(route => (
                        <option key={route?.id} value={route?.id}>
                          {route?.source || 'Unknown'} → {route?.destination || 'Unknown'} (BTN {route?.baseFare || 0})
                        </option>
                      )) : null}
                    </Select>
                    {errors.routeId && (
                      <p className="text-sm text-red-600">{errors.routeId}</p>
                    )}
                    {scheduleFormData.routeId && !editingSchedule && (
                      <p className="text-sm text-muted-foreground">
                        Route is pre-selected for this schedule
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Departure Time *</Label>
                    <Input
                      id="departureTime"
                      type="datetime-local"
                      value={scheduleFormData.departureTime}
                      onChange={(e) => handleScheduleInputChange('departureTime', e.target.value)}
                    />
                    {errors.departureTime && (
                      <p className="text-sm text-red-600">{errors.departureTime}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrivalTime">Arrival Time *</Label>
                    <Input
                      id="arrivalTime"
                      type="datetime-local"
                      value={scheduleFormData.arrivalTime}
                      onChange={(e) => handleScheduleInputChange('arrivalTime', e.target.value)}
                    />
                    {errors.arrivalTime && (
                      <p className="text-sm text-red-600">{errors.arrivalTime}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (BTN) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={scheduleFormData.price}
                      onChange={(e) => handleScheduleInputChange('price', e.target.value)}
                      placeholder="e.g., 150.00"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={submittingSchedule}>
                    {submittingSchedule ? 'Saving...' : (editingSchedule ? 'Update Schedule' : 'Add Schedule')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetScheduleForm} disabled={submittingSchedule}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Generate Schedules Form */}
        {showGenerateScheduleForm && (
          <Card ref={generateScheduleFormRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Schedules
              </CardTitle>
              <CardDescription>
                Generate schedules for this bus automatically. Specify the start date and number of days to generate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateSchedules} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={generateScheduleData.startDate}
                      onChange={(e) => setGenerateScheduleData(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Select the starting date for schedule generation
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Number of Days *</Label>
                    <Input
                      id="days"
                      type="number"
                      min="1"
                      value={generateScheduleData.days}
                      onChange={(e) => setGenerateScheduleData(prev => ({
                        ...prev,
                        days: e.target.value
                      }))}
                      placeholder="e.g., 7"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of days to generate schedules for
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={generatingSchedules}
                    onClick={(e) => {
                      // Ensure form validation passes before allowing submission
                      const form = e.target.closest('form');
                      if (form && !form.checkValidity()) {
                        e.preventDefault();
                        form.reportValidity();
                        return;
                      }
                    }}
                  >
                    {generatingSchedules ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Schedules
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowGenerateScheduleForm(false);
                      setGenerateScheduleData({
                        startDate: new Date().toISOString().split('T')[0],
                        days: 1
                      });
                    }} 
                    disabled={generatingSchedules}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        {showBookingForm && selectedScheduleForBooking && (
          <Card ref={bookingFormRef}>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                Book Seats
              </CardTitle>
              <CardDescription>
                Select seats and enter passenger details for schedule: {formatTime(selectedScheduleForBooking.departureTime)} → {formatTime(selectedScheduleForBooking.arrivalTime)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSeats ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading available seats...</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {/* Seat Selection */}
                  <div>
                    <Label className="mb-3 block">Select Seats *</Label>
                    {availableSeats.length > 0 ? (
                      <>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-4 bg-muted/30 rounded-lg max-h-96 overflow-y-auto">
                          {availableSeats.map((seat) => {
                            const isSelected = selectedSeats.some(s => s.id === seat.id);
                            const isBooked = seat.status === 'BOOKED' || seat.isBooked || seat.available === false;
                            const seatNumber = seat.seatNumber || seat.startNo || seat.id;
                            const seatType = seat.seatType ? seat.seatType.replace('_', ' ') : '';
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => !isBooked && handleSeatToggle(seat)}
                                disabled={isBooked}
                                className={`
                                  p-3 border rounded text-center text-sm font-medium transition-all
                                  ${isBooked 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400' 
                                    : isSelected
                                    ? 'bg-blue-500 text-white border-blue-600'
                                    : 'bg-background hover:bg-muted border-border'
                                  }
                                `}
                                title={isBooked ? 'Seat already booked' : `Seat ${seatNumber}${seat.seatLabel ? ` (${seat.seatLabel})` : ''}${seatType ? ` - ${seatType}` : ''}`}
                              >
                                <div className="font-semibold">{seatNumber}</div>
                                {seatType && (
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    {seatType}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-3 flex gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-background border border-border rounded"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span>Selected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            <span>Booked</span>
                          </div>
                        </div>
                        {selectedSeats.length > 0 && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Selected: {selectedSeats.map(s => s.seatLabel || s.label || `S${s.id}`).join(', ')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No seats available for this schedule.</p>
                    )}
                  </div>

                  {/* Booking Details - Auto-filled from selections */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="scheduleId">Schedule ID *</Label>
                      <Input
                        id="scheduleId"
                        value={bookingFormData.scheduleId}
                        readOnly
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled from selected schedule</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatNumbers">Seat Numbers *</Label>
                      <Input
                        id="seatNumbers"
                        value={bookingFormData.seatNumbers.join(', ')}
                        readOnly
                        className="bg-muted"
                        placeholder="Select seats to auto-fill"
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled when seats are selected</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="seatLabels">Seat Labels *</Label>
                      <Input
                        id="seatLabels"
                        value={bookingFormData.seatLabels.join(', ')}
                        readOnly
                        className="bg-muted"
                        placeholder="Select seats to auto-fill"
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled when seats are selected</p>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="applicantCid">CID *</Label>
                      <Input
                        id="applicantCid"
                        value={bookingFormData.applicantCid}
                        onChange={(e) => handleBookingInputChange('applicantCid', e.target.value)}
                        placeholder="e.g., 11501001234"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="applicantMobile">Mobile Number *</Label>
                      <Input
                        id="applicantMobile"
                        type="tel"
                        value={bookingFormData.applicantMobile}
                        onChange={(e) => handleBookingInputChange('applicantMobile', e.target.value)}
                        placeholder="e.g., 17123456"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="applicantEmail">Email *</Label>
                      <Input
                        id="applicantEmail"
                        type="email"
                        value={bookingFormData.applicantEmail}
                        onChange={(e) => handleBookingInputChange('applicantEmail', e.target.value)}
                        placeholder="e.g., passenger@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={bookingFormData.status}
                        onChange={(e) => handleBookingInputChange('status', e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={submittingBooking || selectedSeats.length === 0}>
                      {submittingBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <Ticket className="h-4 w-4 mr-2" />
                          Confirm Booking ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowBookingForm(false);
                        setSelectedScheduleForBooking(null);
                        setSelectedSeats([]);
                        setBookingFormData({
                          scheduleId: '',
                          seatNumbers: [],
                          seatLabels: [],
                          applicantCid: '',
                          applicantMobile: '',
                          applicantEmail: '',
                          status: 'PENDING'
                        });
                      }} 
                      disabled={submittingBooking}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

export default BusDetailsPage;
