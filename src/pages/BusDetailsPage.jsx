import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Bus, Plus, Edit, Trash2, Search, Filter, Eye, Clock, MapPin, Calendar, ArrowLeft } from 'lucide-react';
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
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);
  const [submittingRoute, setSubmittingRoute] = useState(false);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const routeFormRef = useRef(null);
  const scheduleFormRef = useRef(null);
  const [activeTab, setActiveTab] = useState('routes');
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Route form data
  const [routeFormData, setRouteFormData] = useState({
    source: '',
    destination: '',
    distance: '',
    baseFare: '',
    estimatedDuration: ''
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

  // Load routes and schedules on component mount
  useEffect(() => {
    if (busId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadRoutes();
      loadSchedules(); // Load schedules on mount
    }
    
    // Reset the ref when component unmounts or busId changes
    return () => {
      hasLoadedRef.current = false;
      setSchedulesLoaded(false); // Reset schedules loaded state
    };
  }, [busId]);

  const loadRoutes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Load only routes for this specific bus
      const routesResponse = await api.bus.getRoutes();
      
      console.log('Routes API Response:', routesResponse); // Debug log
      
      // Ensure arrays
      const routesData = Array.isArray(routesResponse) ? routesResponse : 
                        routesResponse?.data ? routesResponse.data : 
                        routesResponse?.routes ? routesResponse.routes : [];
      
      console.log('Parsed routes data:', routesData); // Debug log
      
      // Since routes don't have busId, we'll show all routes for now
      // TODO: Implement proper filtering when busId is available in routes
      const busRoutes = routesData.filter(route => route && route.id); // Filter valid routes
      
      // Use bus data from navigation state if available, otherwise create minimal bus object
      const busFromState = location.state?.bus;
      const currentBus = busFromState || {
        id: parseInt(busId),
        busName: 'Bus Details',
        busNumber: `BT-${busId.toString().padStart(3, '0')}`,
        busType: 'Standard',
        totalSeats: 50,
        description: 'Bus details loaded from routes and schedules',
        amenities: 'AC, WiFi, Water',
        status: 'active'
      };
      
      setBus(currentBus);
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

  const loadSchedules = async () => {
    if (schedulesLoaded) return; // Don't reload if already loaded
    
    try {
      setSchedulesLoading(true);
      
      // Load schedules for this specific bus
      const schedulesResponse = await api.bus.getSchedules();
      
      console.log('Schedules API Response:', schedulesResponse); // Debug log
      
      // Ensure arrays
      const schedulesData = Array.isArray(schedulesResponse) ? schedulesResponse : 
                           schedulesResponse?.data ? schedulesResponse.data : 
                           schedulesResponse?.schedules ? schedulesResponse.schedules : [];
      
      console.log('Parsed schedules data:', schedulesData); // Debug log
      
      // Since schedules don't have busId, we'll show all schedules for now
      // TODO: Implement proper filtering when busId is available in schedules
      const busSchedules = schedulesData.filter(schedule => schedule && schedule.id); // Filter valid schedules
      
      setSchedules(busSchedules);
      setSchedulesLoaded(true);
    } catch (error) {
      console.error('Error loading schedules:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load schedules.',
        confirmButtonText: 'OK'
      });
    } finally {
      setSchedulesLoading(false);
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
        estimatedDuration: parseInt(routeFormData.estimatedDuration)
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
      
      // Switch to routes tab to show the newly created route
      setActiveTab('routes');
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

      resetScheduleForm();
      await loadSchedules();
      
      // Switch to schedules tab to show the newly created schedule
      setActiveTab('schedules');
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
      estimatedDuration: ''
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

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setRouteFormData({
      source: route.source || '',
      destination: route.destination || '',
      distance: route.distance?.toString() || '',
      baseFare: route.baseFare?.toString() || '',
      estimatedDuration: route.estimatedDuration?.toString() || ''
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
        await loadSchedules();
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
      title={`${bus.busName} (${bus.busNumber})`}
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
            <CardTitle className="flex items-center gap-2 text-xl">
              Bus Information
            </CardTitle>
            <CardDescription>
              Details and specifications for this bus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bus Name</p>
                <p className="text-lg font-semibold">{bus.busName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bus Number</p>
                <p className="text-lg font-semibold">{bus.busNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bus Type</p>
                <p className="text-lg font-semibold">{bus.busType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Seats</p>
                <p className="text-lg font-semibold">{bus.totalSeats}</p>
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
                  {bus.amenities.split(', ').map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity.trim()}
                    </Badge>
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
                <CardTitle className="text-lg">Routes & Schedules</CardTitle>
                <CardDescription>
                  Manage routes and schedules for this bus.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'routes' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('routes')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Routes ({routes.length})
                </Button>
                <Button
                  variant={activeTab === 'schedules' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('schedules')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedules ({schedules.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Routes Tab */}
            {activeTab === 'routes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Routes</h3>
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
                    <Button onClick={() => setShowAddRouteForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Route
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {routes.map((route) => (
                      <Card key={route.id} className="border">
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRoute(route)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRoute(route)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Schedules</h3>
                  <Button onClick={() => {
                    setShowAddScheduleForm(true);
                    scrollToScheduleForm();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </div>
                
                {schedulesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading schedules...</p>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
                    <p className="text-muted-foreground mb-4">Add schedules for this bus to get started.</p>
                    <Button onClick={() => setShowAddScheduleForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Schedule
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedules.map((schedule) => {
                      const route = routes.find(r => r && r.id === schedule.routeId);
                      const status = getScheduleStatus(schedule.departureTime);
                      return (
                        <Card key={schedule.id} className="border">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="text-lg font-semibold">
                                    {route ? `${route.source} → ${route.destination}` : 'Unknown Route'}
                                  </h4>
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
                                
                                {/* Additional Schedule Information */}
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Schedule Details:</span>
                                  </div>
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Status:</span>
                                      <span className="ml-2 font-medium">
                                        {schedule.active ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Available Seats:</span>
                                      <span className="ml-2 font-medium">{schedule.availableSeats || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditSchedule(schedule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteSchedule(schedule)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
      </div>
    </PageWrapper>
  );
}

export default BusDetailsPage;
