import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Plus, Edit, Trash2, Search, Eye, RefreshCw, Save, X, AlertCircle, Grid3x3, Armchair } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/lib/apiService';
import { validateBusForm, validateLayoutType, validateRecurrenceType, buildBusApiPayload, computeBusOperatingDays } from '@/lib/validation';
import { RecurrenceType } from '@/lib/constants';
import Swal from 'sweetalert2';

function TooltipButton({ icon, label, onClick, disabled, danger }) {
  const [pos, setPos] = useState(null);

  return (
    <div
      className="relative"
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: r.left + r.width / 2, y: r.top });
      }}
      onMouseLeave={() => setPos(null)}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
          danger
            ? 'hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive'
            : 'hover:border-foreground/30 hover:bg-muted hover:text-foreground'
        }`}
      >
        {icon}
      </button>
      {pos && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: pos.x, top: pos.y - 10, transform: 'translate(-50%, -100%)' }}
        >
          <span className="block whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl">
            {label}
          </span>
          <span className="block absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

function BusManagementPage() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const hasLoadedRef = useRef(false);

  // Edit form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [editFormData, setEditFormData] = useState({
    busName: '',
    busNumber: '',
    busType: '',
    totalSeats: '',
    layoutType: '',
    recurrenceType: '',
    description: '',
    amenities: '',
    operatingDays: null
  });
  const [editErrors, setEditErrors] = useState({});
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const editFormRef = useRef(null);
  const [generatingSeats, setGeneratingSeats] = useState({});

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
    return matchesSearch && matchesType;
  }) : [];

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setEditFormData({
      busName: bus.busName || '',
      busNumber: bus.busNumber || '',
      busType: bus.busType || '',
      totalSeats: bus.totalSeats?.toString() || '',
      layoutType: bus.layoutType || '',
      recurrenceType: bus.recurrenceType || '',
      description: bus.description || '',
      amenities: bus.amenities || '',
      operatingDays: Array.isArray(bus.operatingDays)
        ? bus.operatingDays
        : Array.isArray(bus.operating_days)
          ? bus.operating_days
          : null
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
    
    // Handle Select components - ensure empty string for empty selection
    if (value === null || value === undefined) {
      processedValue = '';
    }
    
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
        
      case 'layoutType':
        if (!value || value.trim() === '') {
          newErrors.layoutType = 'Layout type is required';
        } else {
          const validation = validateLayoutType(value);
          if (!validation.isValid) {
            newErrors.layoutType = validation.message;
          } else {
            delete newErrors.layoutType;
          }
        }
        break;
        
      case 'recurrenceType':
        if (!value || value.trim() === '') {
          newErrors.recurrenceType = 'Recurrence type is required';
        } else {
          const validation = validateRecurrenceType(value);
          if (!validation.isValid) {
            newErrors.recurrenceType = validation.message;
          } else {
            delete newErrors.recurrenceType;
          }
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
      const payload = buildBusApiPayload(editFormData);

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
          layoutType: '',
          recurrenceType: '',
          description: '',
          amenities: '',
          operatingDays: null
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
      layoutType: '',
      recurrenceType: '',
      description: '',
      amenities: '',
      operatingDays: null
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

  const handleGenerateSeats = async (bus) => {
    const result = await Swal.fire({
      title: 'Generate Seats?',
      text: `This will generate seat configurations for ${bus.busName} (${bus.busNumber}). This action cannot be undone.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, generate seats!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setGeneratingSeats(prev => ({ ...prev, [bus.id]: true }));
      
      try {
        // Show loading alert
        Swal.fire({
          title: 'Generating Seats...',
          text: `Please wait while we generate seat configurations for ${bus.busName}.`,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await api.bus.generateSeats(bus.id);
        
        console.log('Generate seats response:', response);
        
        // Show success alert
        await Swal.fire({
          icon: 'success',
          title: 'Seats Generated Successfully!',
          text: response?.message || `Seat configurations have been generated for ${bus.busName} (${bus.busNumber}).`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981'
        });
        
        // Refresh buses list to get updated data
        loadBuses();
      } catch (error) {
        console.error('Error generating seats:', error);
        
        // Extract error message from various possible response structures
        let errorMessage = 'Failed to generate seats. Please try again.';
        
        if (error?.response?.data) {
          const errorData = error.response.data;
          // Check for error in different formats
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Parse database errors for better user understanding
        if (errorMessage.includes('seat_type') || errorMessage.includes('Data truncated')) {
          errorMessage = 'Database error: The seat type configuration is invalid. Please ensure the bus has valid seat configuration settings.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Failed to Generate Seats',
          html: `
            <div class="text-left">
              <p class="mb-2">${errorMessage}</p>
              <p class="form-field-hint mt-2">
                This may be due to invalid seat type configuration. Please contact support if the issue persists.
              </p>
            </div>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444',
          width: '500px'
        });
      } finally {
        setGeneratingSeats(prev => {
          const newState = { ...prev };
          delete newState[bus.id];
          return newState;
        });
      }
    }
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
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or number…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Luxury">Luxury</option>
              <option value="Sleeper">Sleeper</option>
              <option value="AC">AC</option>
            </select>
          </div>
          <Button onClick={() => navigate('/dashboard/bus/add')} className="shrink-0 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Bus
          </Button>
        </div>

        {/* ── Mobile cards (< md) ── */}
        {filteredBuses.length > 0 ? (
          <>
            <div className="md:hidden space-y-3">
              {filteredBuses.map((bus) => {
                const amenityList = bus.amenities
                  ? bus.amenities.split(',').map((a) => a.trim()).filter(Boolean)
                  : [];
                const isActive = !bus.status || bus.status === 'active';
                const isMaintenance = bus.status === 'maintenance';
                const statusLabel = isMaintenance ? 'Maintenance' : isActive ? 'Active' : 'Inactive';

                return (
                  <div key={bus.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    {/* Top row: name + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{bus.busName}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">{bus.busNumber}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                        {statusLabel}
                      </span>
                    </div>

                    {/* Meta row: type · seats */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{bus.busType || '—'}</span>
                      {bus.layoutType && <><span>·</span><span>{bus.layoutType}</span></>}
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Armchair className="h-3 w-3 shrink-0" />
                        {bus.totalSeats} seats
                      </span>
                    </div>

                    {/* Amenities */}
                    {amenityList.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {amenityList.slice(0, 4).map((a, i) => (
                          <span key={i} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {a}
                          </span>
                        ))}
                        {amenityList.length > 4 && (
                          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            +{amenityList.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {bus.description && (
                      <p className="text-xs text-muted-foreground/70 line-clamp-2">{bus.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border">
                      <button
                        onClick={() => handleViewBus(bus)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        onClick={() => handleGenerateSeats(bus)}
                        disabled={!!generatingSeats[bus.id]}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {generatingSeats[bus.id]
                          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          : <Grid3x3 className="h-3.5 w-3.5" />}
                        Seats
                      </button>
                      <button
                        onClick={() => handleEditBus(bus)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBus(bus)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-destructive/30 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop / tablet table (md+) ── */}
            <div className="hidden md:block rounded-xl border border-border bg-card">
              {/* Header — Amenities col hidden below lg */}
              <div className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr_auto] lg:grid-cols-[2fr_1fr_1fr_2fr_1fr_auto] md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border bg-muted/40 rounded-t-xl">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bus</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seats</span>
                <span className="hidden lg:block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amenities</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</span>
              </div>

              <div className="divide-y divide-border">
                {filteredBuses.map((bus) => {
                  const amenityList = bus.amenities
                    ? bus.amenities.split(',').map((a) => a.trim()).filter(Boolean)
                    : [];
                  const isActive = !bus.status || bus.status === 'active';
                  const isMaintenance = bus.status === 'maintenance';

                  return (
                    <div
                      key={bus.id}
                      className="group grid grid-cols-[2fr_1fr_1fr_1fr_auto] lg:grid-cols-[2fr_1fr_1fr_2fr_1fr_auto] gap-4 items-center px-5 py-4 transition-colors hover:bg-muted/30"
                    >
                      {/* Bus */}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{bus.busName}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">{bus.busNumber}</p>
                        {bus.description && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{bus.description}</p>
                        )}
                      </div>

                      {/* Type */}
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{bus.busType || '—'}</p>
                        {bus.layoutType && (
                          <p className="text-xs text-muted-foreground mt-0.5">{bus.layoutType}</p>
                        )}
                      </div>

                      {/* Seats */}
                      <div className="flex items-center gap-1.5">
                        <Armchair className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">{bus.totalSeats}</span>
                      </div>

                      {/* Amenities — hidden on md, visible on lg */}
                      <div className="hidden lg:flex flex-wrap gap-1">
                        {amenityList.slice(0, 3).map((a, i) => (
                          <span key={i} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {a}
                          </span>
                        ))}
                        {amenityList.length > 3 && (
                          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            +{amenityList.length - 3}
                          </span>
                        )}
                        {amenityList.length === 0 && <span className="text-xs text-muted-foreground/50">—</span>}
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                          isMaintenance
                            ? 'border-border bg-muted text-muted-foreground'
                            : isActive
                            ? 'border-border bg-muted text-foreground'
                            : 'border-border bg-muted text-muted-foreground'
                        }`}>
                          {isMaintenance ? 'Maintenance' : isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <TooltipButton icon={<Eye className="h-3.5 w-3.5" />} label="View Routes" onClick={() => handleViewBus(bus)} />
                        <TooltipButton
                          icon={generatingSeats[bus.id] ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Grid3x3 className="h-3.5 w-3.5" />}
                          label="Generate Seats"
                          onClick={() => handleGenerateSeats(bus)}
                          disabled={!!generatingSeats[bus.id]}
                        />
                        <TooltipButton icon={<Edit className="h-3.5 w-3.5" />} label="Edit" onClick={() => handleEditBus(bus)} />
                        <TooltipButton icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" onClick={() => handleDeleteBus(bus)} danger />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer count */}
              <div className="border-t border-border px-5 py-2.5 bg-muted/20 rounded-b-xl">
                <p className="text-xs text-muted-foreground">
                  {filteredBuses.length} of {displayBuses.length} buses
                </p>
              </div>
            </div>

            {/* Mobile footer count */}
            <p className="md:hidden text-xs text-muted-foreground px-1">
              {filteredBuses.length} of {displayBuses.length} buses
            </p>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
              <Bus className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              {searchTerm || filterType !== 'all' ? 'No buses match your search' : 'No buses in your fleet'}
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              {searchTerm || filterType !== 'all'
                ? 'Try a different name, number, or bus type.'
                : 'Add your first bus to get started.'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={() => navigate('/dashboard/bus/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Bus
              </Button>
            )}
          </div>
        )}

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
                </div>

                {/* Bus Type and Recurrence Type */}
                <div className="grid gap-4 md:grid-cols-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-recurrenceType">Recurrence Type *</Label>
                    <Select
                      id="edit-recurrenceType"
                      value={editFormData.recurrenceType}
                      onChange={(e) => handleEditInputChange('recurrenceType', e.target.value)}
                      className={editErrors.recurrenceType ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                    >
                      <option value="">Select recurrence type</option>
                      <option value={RecurrenceType.DAILY}>Daily - Bus runs every day</option>
                      <option value={RecurrenceType.ALTERNATE}>Alternate - Bus runs every 2 days</option>
                      <option value={RecurrenceType.CUSTOM}>Custom - Uses operating days set (manual)</option>
                    </Select>
                    {editErrors.recurrenceType && (
                      <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{editErrors.recurrenceType}</span>
                      </div>
                    )}
                    <p className="form-field-hint">
                      Schedule recurrence pattern for bus operations
                    </p>
                    {editFormData.recurrenceType === RecurrenceType.ALTERNATE && (
                      <div className="form-field-hint mt-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                        <p className="not-italic">
                          <span className="italic">Operating days set to</span>{' '}
                          <span className="font-semibold text-foreground">
                            {computeBusOperatingDays(editFormData).join(', ')}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seating Configuration */}
                <div className="grid gap-4 md:grid-cols-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-layoutType">Layout Type *</Label>
                    <Select
                      id="edit-layoutType"
                      value={editFormData.layoutType}
                      onChange={(e) => handleEditInputChange('layoutType', e.target.value)}
                      className={editErrors.layoutType ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-100 focus:ring-0 focus:ring-blue-100'}
                    >
                      <option value="">Select layout type</option>
                      <option value="1+2">1+2 (19 seats)</option>
                      <option value="2+2">2+2 (32 seats)</option>
                      <option value="2+3">2+3 (40 seats)</option>
                    </Select>
                    {editErrors.layoutType && (
                      <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{editErrors.layoutType}</span>
                      </div>
                    )}
                    <p className="form-field-hint">
                      Seat configuration (e.g., 1+2 = 1 seat left, 2 seats right)
                    </p>
                  </div>
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
                  <p className="form-field-hint">
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
                  <p className="form-field-hint">
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
