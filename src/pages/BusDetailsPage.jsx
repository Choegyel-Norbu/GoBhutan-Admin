import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Bus, Plus, Edit, Trash2, Eye, MapPin, Calendar, ArrowLeft, Ticket, Sparkles, RefreshCw, ArrowRight, Hash, Tag, Users, LayoutGrid } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { api, apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import { buildBusLockBookingPayload, syncApplicantArraysForSeats } from '@/lib/busBooking';
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
  const routeFormRef = useRef(null);
  const generateScheduleFormRef = useRef(null);
  const schedulesSectionRefs = useRef({}); // Refs for each route's schedules section
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);
  const [showGenerateScheduleForm, setShowGenerateScheduleForm] = useState(false);
  const [generatingSchedules, setGeneratingSchedules] = useState(false);
  const [generateScheduleData, setGenerateScheduleData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    days: 30
  });
  const [editingRoute, setEditingRoute] = useState(null);
  const [togglingSchedule, setTogglingSchedule] = useState({});
  const [viewingRouteSchedules, setViewingRouteSchedules] = useState(null); // Track which route's schedules are being viewed
  const [routeSchedules, setRouteSchedules] = useState({}); // Store schedules for each route
  const [loadingRouteSchedules, setLoadingRouteSchedules] = useState({}); // Track loading state per route
  
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
    applicantCids: [],
    applicantNames: [],
    applicantMobiles: [],
    applicantEmail: '',
    status: 'PENDING'
  });
  
  // Generate schedule form data
  // Route form data
  const [routeFormData, setRouteFormData] = useState({
    source: '',
    destination: '',
    distance: '',
    baseFare: '',
    estimatedDurationMinutes: '',
    departureTime: '',
    appCharges: '',
    active: true
  });

  const [routeMasters, setRouteMasters] = useState([]);
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

  useEffect(() => {
    api.bus.getRouteMasters(true)
      .then(resp => {
        const data = Array.isArray(resp) ? resp : resp?.data ?? [];
        setRouteMasters(data.filter(m => m?.active !== false));
      })
      .catch(() => {});
  }, []);

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
    if (!routeFormData.estimatedDurationMinutes || parseInt(routeFormData.estimatedDurationMinutes) <= 0) {
      newErrors.estimatedDurationMinutes = 'Estimated duration must be greater than 0';
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
        estimatedDurationMinutes: parseInt(routeFormData.estimatedDurationMinutes),
        departureTime: routeFormData.departureTime || '10:30',
        appCharges: routeFormData.appCharges ? parseFloat(routeFormData.appCharges) : 0,
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

  const resetRouteForm = () => {
    setRouteFormData({
      source: '',
      destination: '',
      distance: '',
      baseFare: '',
      estimatedDurationMinutes: '',
      departureTime: '',
      appCharges: '',
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

  const scrollToGenerateScheduleForm = () => {
    setTimeout(() => {
      if (generateScheduleFormRef.current) {
        generateScheduleFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        applicantCids: [],
        applicantNames: [],
        applicantMobiles: [],
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
        const seatNumbers = newSeats.map(s => s.startNo || s.seatNumber || s.id);
        const seatLabels = newSeats.map(s => s.seatLabel || s.label || `Seat ${s.id}`);
        setBookingFormData((prevData) => ({
          ...prevData,
          ...syncApplicantArraysForSeats(
            seatNumbers,
            seatLabels,
            prevData.applicantCids,
            prevData.applicantNames,
            prevData.seatNumbers,
            prevData.applicantMobiles
          ),
        }));
        return newSeats;
      } else {
        const newSeats = [...prev, seat];
        const seatNumbers = newSeats.map(s => s.startNo || s.seatNumber || s.id);
        const seatLabels = newSeats.map(s => s.seatLabel || s.label || `Seat ${s.id}`);
        setBookingFormData((prevData) => ({
          ...prevData,
          ...syncApplicantArraysForSeats(
            seatNumbers,
            seatLabels,
            prevData.applicantCids,
            prevData.applicantNames,
            prevData.seatNumbers,
            prevData.applicantMobiles
          ),
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

  const handlePassengerFieldChange = (seatIndex, field, value) => {
    const arrayKey =
      field === 'cid' ? 'applicantCids' : field === 'name' ? 'applicantNames' : 'applicantMobiles';
    setBookingFormData((prev) => {
      const next = [...(prev[arrayKey] || [])];
      while (next.length < prev.seatNumbers.length) next.push('');
      next[seatIndex] = value;
      return { ...prev, [arrayKey]: next };
    });
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
    const missingCid = (bookingFormData.applicantCids || []).some((c) => !String(c || '').trim());
    const missingName = (bookingFormData.applicantNames || []).some((n) => !String(n || '').trim());
    if (missingCid || bookingFormData.applicantCids.length !== selectedSeats.length) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a CID for each selected seat.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    if (missingName || bookingFormData.applicantNames.length !== selectedSeats.length) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a name for each selected seat.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    const missingMobile = (bookingFormData.applicantMobiles || []).some((m) => !String(m || '').trim());
    if (missingMobile || bookingFormData.applicantMobiles.length !== selectedSeats.length) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a mobile number for each selected seat.',
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
      
      const seatNumbersRaw =
        bookingFormData.seatNumbers.length > 0
          ? bookingFormData.seatNumbers
          : selectedSeats.map((seat) => seat.startNo ?? seat.seatNumber ?? seat.id);
      const seatLabelsRaw =
        bookingFormData.seatLabels.length > 0
          ? bookingFormData.seatLabels
          : selectedSeats.map(
              (seat) => seat.seatLabel || seat.label || `Seat ${seat.id ?? seat.seatNumber ?? ''}`
            );

      const payload = buildBusLockBookingPayload({
        scheduleId: parseInt(bookingFormData.scheduleId, 10) || selectedScheduleForBooking?.id,
        seatNumbers: seatNumbersRaw,
        seatLabels: seatLabelsRaw,
        applicantCids: bookingFormData.applicantCids,
        applicantNames: bookingFormData.applicantNames,
        applicantMobiles: bookingFormData.applicantMobiles,
        applicantEmail: bookingFormData.applicantEmail,
        status: bookingFormData.status || 'PENDING',
      });

      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }

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
        applicantCids: [],
        applicantNames: [],
        applicantMobiles: [],
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
      estimatedDurationMinutes: route.estimatedDurationMinutes?.toString() || '',
      departureTime: route.departureTime || '',
      appCharges: route.appCharges?.toString() || '',
      active: route.active !== undefined ? route.active : true
    });
    setShowAddRouteForm(true);
    scrollToRouteForm();
  };

  const handleToggleSchedule = async (schedule, routeId) => {
    setTogglingSchedule(prev => ({ ...prev, [schedule.id]: true }));
    try {
      await api.bus.toggleSchedule(schedule.id);
      setRouteSchedules(prev => {
        const newSchedules = { ...prev };
        delete newSchedules[routeId];
        return newSchedules;
      });
      await loadSchedulesForRoute(routeId);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to toggle schedule.', confirmButtonText: 'OK' });
    } finally {
      setTogglingSchedule(prev => { const s = { ...prev }; delete s[schedule.id]; return s; });
    }
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

  const handleDeleteSchedule = async (schedule, routeId) => {
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

        setRouteSchedules(prev => {
          const newSchedules = { ...prev };
          delete newSchedules[routeId];
          return newSchedules;
        });
        await loadSchedulesForRoute(routeId);
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
    if (generatingSchedules) return;
    setGeneratingSchedules(true);
    try {
      const payload = {
        busId: parseInt(busId),
        startDate: generateScheduleData.startDate,
        days: parseInt(generateScheduleData.days),
      };
      await api.bus.generateSchedules(payload);
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Schedules generated for ${generateScheduleData.days} day(s) from ${generateScheduleData.startDate}.`,
        confirmButtonText: 'OK',
      });
      const currentlyViewingRoute = viewingRouteSchedules;
      // Generation affects all routes of this bus — wipe the full cache
      setRouteSchedules({});
      setGenerateScheduleData({ startDate: new Date().toISOString().split('T')[0], days: 30 });
      setShowGenerateScheduleForm(false);
      if (currentlyViewingRoute) {
        await loadSchedulesForRoute(currentlyViewingRoute, true);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to generate schedules.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonText: 'OK' });
    } finally {
      setGeneratingSchedules(false);
    }
  };

  const loadSchedulesForRoute = async (routeId, forceRefresh = false) => {
    // If already viewing this route's schedules, hide them
    if (!forceRefresh && viewingRouteSchedules === routeId) {
      setViewingRouteSchedules(null);
      return;
    }

    // If schedules are already loaded, just show them
    if (!forceRefresh && routeSchedules[routeId]) {
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
      title={bus.busName || bus.busNumber || `Bus ${bus.id}`}
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
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Identity header */}
            <div className="flex flex-wrap items-center gap-4 px-6 pt-6 pb-5 border-b border-border">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Bus className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold leading-tight text-foreground">
                    {bus.busName || bus.busNumber || `Bus ${bus.id}`}
                  </h2>
                  {bus.busName && bus.busNumber && (
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                      {bus.busNumber}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {[bus.busType, bus.layoutType && `${bus.layoutType} layout`, (bus.totalSeats || seats.length) && `${bus.totalSeats || seats.length} seats`].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border-b border-border">
              {[
                { Icon: Hash,       label: 'Bus Number',  value: bus.busNumber || 'N/A' },
                { Icon: Tag,        label: 'Bus Type',    value: bus.busType   || 'N/A' },
                { Icon: Users,      label: 'Total Seats', value: bus.totalSeats || seats.length || 0 },
                { Icon: LayoutGrid, label: 'Layout',      value: bus.layoutType || 'N/A' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 bg-card px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description + Amenities */}
            {(bus.description || bus.amenities) && (
              <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
                {bus.description && (
                  <div className="flex-1 px-6 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{bus.description}</p>
                  </div>
                )}
                {bus.amenities && (
                  <div className="flex-1 px-6 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {typeof bus.amenities === 'string'
                        ? bus.amenities.split(',').map((a, i) => (
                            <span key={i} className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
                              {a.trim()}
                            </span>
                          ))
                        : (
                            <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
                              {bus.amenities}
                            </span>
                          )
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seats */}
            {seats.length > 0 && (
              <div className="px-6 pb-6 pt-0 border-t border-border">
                <div className="mt-4 rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">Seats</span>
                    <span className="text-xs text-muted-foreground">({seats.length} total)</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-3">
                    {seats.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex flex-col items-center gap-0.5 p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-center"
                        title={`Seat ${seat.seatLabel} - ${seat.seatType}`}
                      >
                        <span className="text-sm font-semibold">{seat.seatNumber || seat.startNo || seat.id}</span>
                        <span className="text-xs text-muted-foreground">{seat.seatLabel}</span>
                        <span className="text-[10px] text-muted-foreground/70 capitalize">{seat.seatType.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
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
              <Button
                variant="outline"
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
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => {
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
                  <div className="space-y-3">
                    {routes.map((route) => (
                      <div key={route.id} className="space-y-3">
                        <div className={`rounded-xl border transition-colors ${viewingRouteSchedules === route.id ? 'border-primary/30 bg-primary/[0.02]' : 'border-border bg-card'}`}>
                          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                            {/* Route identity */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${viewingRouteSchedules === route.id ? 'bg-primary/15' : 'bg-muted'}`}>
                                <MapPin className={`h-4 w-4 transition-colors ${viewingRouteSchedules === route.id ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-base font-semibold text-foreground">
                                  {route.source} <span className="mx-0.5 font-normal text-muted-foreground">→</span> {route.destination}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                  <span className="text-xs text-muted-foreground">{route.distance} km</span>
                                  <span className="text-xs text-muted-foreground/40">·</span>
                                  <span className="text-xs text-muted-foreground">BTN {route.baseFare}</span>
                                  <span className="text-xs text-muted-foreground/40">·</span>
                                  <span className="text-xs text-muted-foreground">{route.estimatedDurationMinutes} min</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                variant={viewingRouteSchedules === route.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => loadSchedulesForRoute(route.id)}
                                disabled={loadingRouteSchedules[route.id]}
                                className="h-8 text-xs px-3"
                              >
                                {loadingRouteSchedules[route.id] ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                ) : viewingRouteSchedules === route.id ? (
                                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                                ) : (
                                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                {loadingRouteSchedules[route.id] ? 'Loading…' : viewingRouteSchedules === route.id ? 'Hide Schedules' : 'View Schedules'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRoute(route)}
                                aria-label="Edit route"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRoute(route)}
                                aria-label="Delete route"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Route Schedules Display */}
                        {viewingRouteSchedules === route.id && (
                          <div
                            ref={(el) => { if (el) schedulesSectionRefs.current[route.id] = el; }}
                            className="mt-3 rounded-xl border border-border shadow-sm overflow-hidden"
                          >
                            {/* Section header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {route.source} → {route.destination}
                                  </p>
                                  {routeSchedules[route.id] && (
                                    <p className="text-xs text-muted-foreground">
                                      {routeSchedules[route.id].filter(s => getScheduleStatus(s.departureTime).status !== 'departed').length} upcoming
                                      {' · '}
                                      {routeSchedules[route.id].length} total
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {loadingRouteSchedules[route.id] ? (
                              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                                <span className="text-sm">Loading schedules…</span>
                              </div>
                            ) : routeSchedules[route.id]?.length > 0 ? (
                              <div className="divide-y divide-border">
                                {routeSchedules[route.id].map((schedule) => {
                                  const status = getScheduleStatus(schedule.departureTime);
                                  return (
                                    <ScheduleRow
                                      key={schedule.id}
                                      schedule={schedule}
                                      status={status}
                                      isDeparted={status.status === 'departed'}
                                      toggling={!!togglingSchedule[schedule.id]}
                                      onToggle={() => handleToggleSchedule(schedule, route.id)}
                                      onDelete={() => handleDeleteSchedule(schedule, route.id)}
                                      onBook={() => handleBookSchedule(schedule)}
                                    />
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center py-12 text-center px-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                                  <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium mb-1">No schedules found</p>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                  No schedules have been generated for this route yet. Use <strong>Generate Schedules</strong> above to create them in bulk.
                                </p>
                              </div>
                            )}
                          </div>
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
                    {routeMasters.length > 0 ? (
                      <Select
                        id="source"
                        value={routeFormData.source}
                        onChange={(e) => handleRouteInputChange('source', e.target.value)}
                      >
                        <option value="">Select source</option>
                        {routeMasters.map(m => (
                          <option key={m.id} value={m.routeName}>{m.routeName}</option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        id="source"
                        value={routeFormData.source}
                        onChange={(e) => handleRouteInputChange('source', e.target.value)}
                        placeholder="e.g., Thimphu"
                      />
                    )}
                    {errors.source && (
                      <p className="text-sm text-red-600">{errors.source}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    {routeMasters.length > 0 ? (
                      <Select
                        id="destination"
                        value={routeFormData.destination}
                        onChange={(e) => handleRouteInputChange('destination', e.target.value)}
                      >
                        <option value="">Select destination</option>
                        {routeMasters.map(m => (
                          <option key={m.id} value={m.routeName}>{m.routeName}</option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        id="destination"
                        value={routeFormData.destination}
                        onChange={(e) => handleRouteInputChange('destination', e.target.value)}
                        placeholder="e.g., Paro"
                      />
                    )}
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
                    <Label htmlFor="estimatedDurationMinutes">Estimated Duration (min) *</Label>
                    <Input
                      id="estimatedDurationMinutes"
                      type="number"
                      value={routeFormData.estimatedDurationMinutes}
                      onChange={(e) => handleRouteInputChange('estimatedDurationMinutes', e.target.value)}
                      placeholder="e.g., 90"
                    />
                    {errors.estimatedDurationMinutes && (
                      <p className="text-sm text-red-600">{errors.estimatedDurationMinutes}</p>
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
                    <p className="form-field-hint">
                      Default departure time for this route (format: HH:MM)
                    </p>
                    {errors.departureTime && (
                      <p className="text-sm text-red-600">{errors.departureTime}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appCharges">App Charges (BTN)</Label>
                    <Input
                      id="appCharges"
                      type="number"
                      step="0.01"
                      min="0"
                      value={routeFormData.appCharges}
                      onChange={(e) => handleRouteInputChange('appCharges', e.target.value)}
                      placeholder="e.g., 0"
                    />
                    <p className="form-field-hint">
                      Platform/app service charge (defaults to 0)
                    </p>
                    {errors.appCharges && (
                      <p className="text-sm text-red-600">{errors.appCharges}</p>
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
                    <p className="form-field-hint">
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

        {/* Generate Schedules Form */}
        {showGenerateScheduleForm && (
          <Card ref={generateScheduleFormRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Schedules
              </CardTitle>
              <CardDescription>
                Automatically generate schedules for this bus. Specify a start date and number of days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateSchedules} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="genStartDate">Start Date *</Label>
                    <Input
                      id="genStartDate"
                      type="date"
                      value={generateScheduleData.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setGenerateScheduleData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genDays">Number of Days *</Label>
                    <Input
                      id="genDays"
                      type="number"
                      min="1"
                      value={generateScheduleData.days}
                      onChange={(e) => setGenerateScheduleData(prev => ({ ...prev, days: e.target.value }))}
                      placeholder="e.g., 30"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <Button type="submit" disabled={generatingSchedules} className="flex items-center gap-2">
                    {generatingSchedules ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />Generating...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" />Generate Schedules</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={generatingSchedules}
                    onClick={() => {
                      setShowGenerateScheduleForm(false);
                      setGenerateScheduleData({ startDate: new Date().toISOString().split('T')[0], days: 30 });
                    }}
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
                          <p className="form-field-hint mt-2">
                            Selected: {selectedSeats.map(s => s.seatLabel || s.label || `S${s.id}`).join(', ')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="form-field-hint">No seats available for this schedule.</p>
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
                      <p className="form-field-hint">Auto-filled from selected schedule</p>
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
                      <p className="form-field-hint">Auto-filled when seats are selected</p>
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
                      <p className="form-field-hint">Auto-filled when seats are selected</p>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  {selectedSeats.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Passenger per seat</h4>
                      <div className="space-y-3">
                        {selectedSeats.map((seat, index) => {
                          const seatLabel =
                            seat.seatLabel || seat.label || bookingFormData.seatLabels[index] || `Seat ${index + 1}`;
                          return (
                            <div
                              key={seat.id ?? `${seatLabel}-${index}`}
                              className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 md:grid-cols-3"
                            >
                              <div className="flex items-center text-sm font-semibold text-foreground md:col-span-3">
                                {seatLabel}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`applicantCid-${index}`}>CID *</Label>
                                <Input
                                  id={`applicantCid-${index}`}
                                  value={bookingFormData.applicantCids[index] || ''}
                                  onChange={(e) => handlePassengerFieldChange(index, 'cid', e.target.value)}
                                  placeholder="e.g., 11501001234"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`applicantName-${index}`}>Name *</Label>
                                <Input
                                  id={`applicantName-${index}`}
                                  value={bookingFormData.applicantNames[index] || ''}
                                  onChange={(e) => handlePassengerFieldChange(index, 'name', e.target.value)}
                                  placeholder="Passenger full name"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`applicantMobile-${index}`}>Mobile *</Label>
                                <Input
                                  id={`applicantMobile-${index}`}
                                  type="tel"
                                  value={bookingFormData.applicantMobiles[index] || ''}
                                  onChange={(e) => handlePassengerFieldChange(index, 'mobile', e.target.value)}
                                  placeholder="e.g., 17123456"
                                  required
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="applicantEmail">Contact Email</Label>
                      <Input
                        id="applicantEmail"
                        type="email"
                        value={bookingFormData.applicantEmail}
                        onChange={(e) => handleBookingInputChange('applicantEmail', e.target.value)}
                        placeholder="Optional"
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
                          applicantCids: [],
                          applicantNames: [],
                          applicantMobiles: [],
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

function formatTimeOnly(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDayDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function ScheduleRow({ schedule, status, isDeparted, toggling, onToggle, onDelete, onBook }) {
  const statusConfig = {
    departed: {
      dot: 'bg-muted-foreground',
      badge: 'bg-muted text-muted-foreground',
      border: 'border-l-border/40',
    },
    boarding: {
      dot: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-700',
      border: 'border-l-amber-500',
    },
    today: {
      dot: 'bg-green-500',
      badge: 'bg-green-50 text-green-700',
      border: 'border-l-green-500',
    },
    upcoming: {
      dot: 'bg-primary',
      badge: 'bg-primary/10 text-primary',
      border: 'border-l-primary/40',
    },
  };
  const cfg = statusConfig[status.status] ?? statusConfig.upcoming;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-l-[3px] transition-colors hover:bg-muted/30 ${cfg.border} ${isDeparted ? 'opacity-60' : ''}`}
    >
      {/* Status badge */}
      <div className="flex items-center gap-1.5 w-24 shrink-0">
        <div className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${cfg.badge}`}>
          {status.status}
        </span>
      </div>

      {/* Departure → Arrival */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="text-sm min-w-0">
          <p className="font-semibold tabular-nums leading-tight">{formatTimeOnly(schedule.departureTime)}</p>
          <p className="text-[11px] text-muted-foreground leading-tight">{formatDayDate(schedule.departureTime)}</p>
        </div>
        <div className="flex items-center gap-0.5 text-muted-foreground shrink-0">
          <div className="h-px w-3 bg-border" />
          <ArrowRight className="h-3 w-3" />
          <div className="h-px w-3 bg-border" />
        </div>
        <div className="text-sm min-w-0">
          <p className="font-semibold tabular-nums leading-tight">{formatTimeOnly(schedule.arrivalTime)}</p>
          <p className="text-[11px] text-muted-foreground leading-tight">{formatDayDate(schedule.arrivalTime)}</p>
        </div>
      </div>

      {/* Price */}
      <div className="text-sm text-right shrink-0">
        <p className="font-semibold tabular-nums">BTN {schedule.finalFare ?? schedule.baseFare ?? '—'}</p>
        <p className="text-[11px] text-muted-foreground">fare</p>
      </div>

      {/* Seats */}
      <div className="text-sm text-right shrink-0 w-12">
        <p className="font-semibold tabular-nums">{schedule.availableSeats ?? '—'}</p>
        <p className="text-[11px] text-muted-foreground">seats</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!isDeparted && (
          <Button
            size="sm"
            variant="outline"
            onClick={onBook}
            className="h-7 text-xs px-2"
            aria-label="Book this schedule"
          >
            <Ticket className="h-3 w-3 mr-1" />
            Book
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          disabled={toggling}
          aria-label={schedule.active ? 'Deactivate schedule' : 'Activate schedule'}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${toggling ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label="Delete schedule"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default BusDetailsPage;
