import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Plus, Edit, Trash2, Search, Filter, Eye, MapPin, Calendar, RefreshCw, Save, X, AlertCircle } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/apiService';
import { validateBusForm, sanitizeInput } from '@/lib/validation';
import Swal from 'sweetalert2';

function BusManagementPage() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const hasLoadedRef = useRef(false);

  // Edit form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [editFormData, setEditFormData] = useState({
    busName: '',
    busNumber: '',
    busType: '',
    totalSeats: '',
    description: '',
    amenities: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const editFormRef = useRef(null);

  // Load buses data on component mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadBuses();
    }
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const response = await api.bus.getBuses();
      
      // Ensure buses is always an array
      const busesData = Array.isArray(response) ? response : 
                       response?.data ? response.data : 
                       response?.buses ? response.buses : [];
      
      setBuses(busesData);
    } catch (error) {
      console.error('Error loading buses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load buses data.',
        confirmButtonText: 'OK'
      });
      // Set empty array on error to prevent filter errors
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Use only API data - no mock data fallback
  const displayBuses = buses;

  const filteredBuses = Array.isArray(displayBuses) ? displayBuses.filter(bus => {
    if (!bus || typeof bus !== 'object') return false;
    const matchesSearch = (bus.busName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = filterType === 'all' || bus.busType === filterType;
    const matchesStatus = filterStatus === 'all' || bus.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) : [];

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setEditFormData({
      busName: bus.busName || '',
      busNumber: bus.busNumber || '',
      busType: bus.busType || '',
      totalSeats: bus.totalSeats?.toString() || '',
      description: bus.description || '',
      amenities: bus.amenities || ''
    });
    setEditErrors({});
    setShowEditForm(true);
    scrollToEditForm();
  };

  const scrollToEditForm = () => {
    setTimeout(() => {
      if (editFormRef.current) {
        editFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleEditInputChange = (field, value) => {
    // Only sanitize inputs that need it (busNumber) and preserve spaces for description/amenities
    let processedValue = value;
    
    if (field === 'busNumber') {
      // For bus number, remove spaces and sanitize
      processedValue = typeof value === 'string' ? value.replace(/\s/g, '') : value;
    } else if (field === 'description' || field === 'amenities') {
      // For description and amenities, preserve spaces but remove potential XSS
      processedValue = typeof value === 'string' ? 
        value.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '') : 
        value;
    } else {
      // For other fields, basic sanitization without trimming spaces
      processedValue = typeof value === 'string' ? 
        value.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '') : 
        value;
    }
    
    setEditFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear error for this field when user starts typing
    if (editErrors[field]) {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time validation for immediate feedback
    validateEditField(field, processedValue);
  };

  const validateEditField = (name, value) => {
    const newErrors = { ...editErrors };
    
    switch (name) {
      case 'busName':
        if (!value.trim()) {
          newErrors.busName = 'Bus name is required';
        } else if (value.trim().length < 2) {
          newErrors.busName = 'Bus name must be at least 2 characters long';
        } else if (value.trim().length > 50) {
          newErrors.busName = 'Bus name must be less than 50 characters';
        } else {
          delete newErrors.busName;
        }
        break;
        
      case 'busNumber':
        if (!value.trim()) {
          newErrors.busNumber = 'Bus number is required';
        } else if (value.trim().length < 3) {
          newErrors.busNumber = 'Bus number must be at least 3 characters long';
        } else if (value.trim().length > 20) {
          newErrors.busNumber = 'Bus number must be less than 20 characters';
        } else if (!/^[a-zA-Z0-9\-]+$/.test(value.trim())) {
          newErrors.busNumber = 'Bus number can only contain letters, numbers, and hyphens';
        } else {
          delete newErrors.busNumber;
        }
        break;
        
      case 'busType':
        if (!value.trim()) {
          newErrors.busType = 'Bus type is required';
        } else {
          delete newErrors.busType;
        }
        break;
        
      case 'totalSeats':
        if (!value || value === '') {
          newErrors.totalSeats = 'Total seats is required';
        } else if (isNaN(parseInt(value))) {
          newErrors.totalSeats = 'Total seats must be a valid number';
        } else if (parseInt(value) < 1) {
          newErrors.totalSeats = 'Total seats must be at least 1';
        } else if (parseInt(value) > 100) {
          newErrors.totalSeats = 'Total seats cannot exceed 100';
        } else {
          delete newErrors.totalSeats;
        }
        break;
        
      case 'description':
        if (value.trim() && value.trim().length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        } else {
          delete newErrors.description;
        }
        break;
        
      case 'amenities':
        if (value.trim() && value.trim().length > 200) {
          newErrors.amenities = 'Amenities must be less than 200 characters';
        } else if (value.trim()) {
          const amenityList = value.split(',').map(a => a.trim()).filter(a => a.length > 0);
          if (amenityList.length > 10) {
            newErrors.amenities = 'Maximum 10 amenities allowed';
          } else {
            // Check individual amenity length
            const longAmenity = amenityList.find(amenity => amenity.length > 30);
            if (longAmenity) {
              newErrors.amenities = 'Each amenity must be less than 30 characters';
            } else {
              delete newErrors.amenities;
            }
          }
        } else {
          delete newErrors.amenities;
        }
        break;
        
      default:
        break;
    }
    
    setEditErrors(newErrors);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingEdit(true);
    
    // Validate form using comprehensive validation
    const validation = validateBusForm(editFormData);
    
    if (!validation.isValid) {
      setEditErrors(validation.errors);
      
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(`edit-${firstErrorField}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      setIsSubmittingEdit(false);
      return;
    }
    
    try {
      // Format the data according to the API schema with proper sanitization
      const payload = {
        busName: sanitizeInput(editFormData.busName),
        busNumber: sanitizeInput(editFormData.busNumber),
        busType: editFormData.busType,
        totalSeats: parseInt(editFormData.totalSeats),
        description: editFormData.description ? sanitizeInput(editFormData.description) : null,
        amenities: editFormData.amenities ? sanitizeInput(editFormData.amenities) : null
      };

      console.log('Update bus payload:', payload);
      
      // Make API call to update bus
      const response = await api.bus.updateBus(editingBus.id, payload);
      
      console.log('Update API Response:', response);
      
      // Handle response
      if (response && (response.success === true || response.id)) {
        // Show success SweetAlert notification
        await Swal.fire({
          icon: 'success',
          title: 'Bus Updated Successfully!',
          text: response.message || `Bus "${editFormData.busName}" (${editFormData.busNumber}) has been updated successfully.`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981'
        });
        
        // Close form and refresh buses list
        setShowEditForm(false);
        setEditingBus(null);
        setEditFormData({
          busName: '',
          busNumber: '',
          busType: '',
          totalSeats: '',
          description: '',
          amenities: ''
        });
        setEditErrors({});
        
        // Refresh the buses list
        loadBuses();
      } else {
        // Throw error for unsuccessful responses
        throw new Error(response?.message || 'Failed to update bus');
      }
      
    } catch (error) {
      console.error('Error updating bus:', error);
      
      let errorMessage = 'Failed to update bus. Please try again or contact support.';
      
      if (error.response) {
        // Server responded with error status
        console.error('Server response:', error.response);
        errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || error.message}`;
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        errorMessage = `Request error: ${error.message}`;
      }
      
      // Show error SweetAlert notification
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Update Bus',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
    
    setIsSubmittingEdit(false);
  };

  const resetEditForm = () => {
    setShowEditForm(false);
    setEditingBus(null);
    setEditFormData({
      busName: '',
      busNumber: '',
      busType: '',
      totalSeats: '',
      description: '',
      amenities: ''
    });
    setEditErrors({});
  };

  const handleDeleteBus = async (bus) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete ${bus.busName} (${bus.busNumber}) from the fleet.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.bus.deleteBus(bus.id);
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${bus.busName} has been deleted from the fleet.`,
          confirmButtonText: 'OK'
        });
        // Refresh the buses list
        loadBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete bus. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleViewBus = (bus) => {
    navigate(`/dashboard/bus/details/${bus.id}`, { state: { bus } });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'default', label: 'Active' },
      maintenance: { variant: 'secondary', label: 'Maintenance' },
      inactive: { variant: 'outline', label: 'Inactive' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <PageWrapper title="Bus Management" description="Loading buses...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading buses...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Bus Management" 
      description="Manage existing buses in your fleet."
    >
      <div className="max-w-7xl mx-auto space-y-6">
        

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Buses
            </CardTitle>
            <CardDescription>
              Find and filter buses in your fleet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterType">Bus Type</Label>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Sleeper">Sleeper</option>
                  <option value="AC">AC Bus</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterStatus">Status</Label>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buses List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Fleet Overview
                </CardTitle>
                <CardDescription>
                  {filteredBuses.length} of {displayBuses.length} buses found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBuses.map((bus) => (
                <Card key={bus.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{bus.busName}</h3>
                          <Badge variant="outline">{bus.busType}</Badge>
                          <Badge variant="secondary">{bus.busNumber}</Badge>
                          {getStatusBadge(bus.status)}
                        </div>
                        
                        <p className="text-muted-foreground text-sm">{bus.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {bus.amenities.split(', ').map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity.trim()}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Seats</p>
                            <p className="font-medium">{bus.totalSeats}</p>
                          </div>
                          {/* <div>
                            <p className="text-muted-foreground">Registered</p>
                            <p className="font-medium">{new Date(bus.registeredDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Service</p>
                            <p className="font-medium">{new Date(bus.lastService).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Service</p>
                            <p className="font-medium">{new Date(bus.nextService).toLocaleDateString()}</p>
                          </div> */}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <div className="relative group">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBus(bus)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            View Routes & Schedules
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                        <div className="relative group">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBus(bus)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            Edit Bus Details
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                        <div className="relative group">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBus(bus)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            Delete Bus
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredBuses.length === 0 && (
                <div className="text-center py-12">
                  <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                      ? 'No buses found'
                      : 'No buses in your fleet'
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria to find buses.'
                      : 'Your bus fleet is currently empty. Add your first bus to get started with managing your transportation services.'
                    }
                  </p>
                  <Button onClick={() => navigate('/dashboard/bus/add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Bus
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Bus Form */}
        {showEditForm && (
          <Card ref={editFormRef}>
            <CardHeader>
              <CardTitle>
                {editingBus ? 'Edit Bus Details' : 'Add New Bus'}
              </CardTitle>
              <CardDescription>
                {editingBus 
                  ? 'Update the bus details below.'
                  : 'Enter the details for the new bus.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-busName">Bus Name *</Label>
                    <Input
                      id="edit-busName"
                      value={editFormData.busName}
                      onChange={(e) => handleEditInputChange('busName', e.target.value)}
                      placeholder="e.g., Dug Transport"
                      className={editErrors.busName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                    />
                    {editErrors.busName && (
                      <p className="text-sm text-red-600">{editErrors.busName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-busNumber">Bus Number *</Label>
                    <Input
                      id="edit-busNumber"
                      value={editFormData.busNumber}
                      onChange={(e) => handleEditInputChange('busNumber', e.target.value)}
                      placeholder="e.g., BP-001"
                      className={editErrors.busNumber ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                    />
                    {editErrors.busNumber && (
                      <p className="text-sm text-red-600">{editErrors.busNumber}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-busType">Bus Type *</Label>
                    <Select
                      id="edit-busType"
                      value={editFormData.busType}
                      onChange={(e) => handleEditInputChange('busType', e.target.value)}
                      className={editErrors.busType ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                    >
                      <option value="">Select bus type</option>
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Sleeper">Sleeper</option>
                      <option value="AC">AC Bus</option>
                    </Select>
                    {editErrors.busType && (
                      <p className="text-sm text-red-600">{editErrors.busType}</p>
                    )}
                  </div>
                </div>

                {/* Total Seats */}
                <div className="space-y-2">
                  <Label htmlFor="edit-totalSeats">Total Seats *</Label>
                  <Input
                    id="edit-totalSeats"
                    type="number"
                    value={editFormData.totalSeats}
                    onChange={(e) => handleEditInputChange('totalSeats', e.target.value)}
                    placeholder="e.g., 50"
                    className={editErrors.totalSeats ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                  />
                  {editErrors.totalSeats && (
                    <p className="text-sm text-red-600">{editErrors.totalSeats}</p>
                  )}
                </div>

                {/* Amenities */}
                <div className="space-y-2">
                  <Label htmlFor="edit-amenities">Amenities</Label>
                  <Input
                    id="edit-amenities"
                    value={editFormData.amenities}
                    onChange={(e) => handleEditInputChange('amenities', e.target.value)}
                    placeholder="e.g., AC, WiFi, Water, Snacks (comma-separated)"
                    className={editErrors.amenities ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                  />
                  {editErrors.amenities && (
                    <p className="text-sm text-red-600">{editErrors.amenities}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Enter amenities separated by commas (e.g., AC, WiFi, Water, Snacks)
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => handleEditInputChange('description', e.target.value)}
                    placeholder="Additional notes about the bus..."
                    rows={3}
                    className={editErrors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0'}
                  />
                  {editErrors.description && (
                    <p className="text-sm text-red-600">{editErrors.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {editFormData.description.length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmittingEdit || Object.keys(editErrors).length > 0}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmittingEdit ? 'Updating Bus...' : (editingBus ? 'Update Bus' : 'Add Bus')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetEditForm}
                    disabled={isSubmittingEdit}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
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

export default BusManagementPage;
