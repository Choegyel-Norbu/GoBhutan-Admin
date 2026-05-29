import { useState, useEffect } from 'react';
import {
  Clapperboard, Film, Building, X,
  DoorOpen, Users, MapPin, ChevronRight, RefreshCw,
  AlertCircle, Link as LinkIcon, Plus, Upload,
  Image as ImageIcon, Trash2
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import { buildScreeningFormData } from '@/lib/screening';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

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

function TheaterPage() {
  const { user } = useAuth();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const [showAddTheaterModal, setShowAddTheaterModal] = useState(false);
  const [addTheaterData, setAddTheaterData] = useState({ name: '', description: '' });
  const [addTheaterErrors, setAddTheaterErrors] = useState({});
  const [isSubmittingTheater, setIsSubmittingTheater] = useState(false);

  const [theaters, setTheaters] = useState({});
  const [loadingTheaters, setLoadingTheaters] = useState({});
  const [theatersError, setTheatersError] = useState({});
  const [selectedTheaterId, setSelectedTheaterId] = useState(null);

  const [halls, setHalls] = useState({});
  const [loadingHalls, setLoadingHalls] = useState({});
  const [hallsError, setHallsError] = useState({});

  const [showAddHallModal, setShowAddHallModal] = useState(false);
  const [addHallData, setAddHallData] = useState({ name: '', totalSeats: '' });
  const [addHallErrors, setAddHallErrors] = useState({});
  const [isSubmittingHall, setIsSubmittingHall] = useState(false);

  const [screeningsByHall, setScreeningsByHall] = useState({});
  const [loadingScreenings, setLoadingScreenings] = useState({});
  const [screeningsError, setScreeningsError] = useState({});
  const [expandedHallId, setExpandedHallId] = useState(null);

  const [screeningFormData, setScreeningFormData] = useState({
    movieName: '',
    screeningDate: '',
    startTime: '',
    trailerLink: '',
    theaterId: '',
    theaterName: '',
    hallId: '',
    hallName: '',
    isActive: true,
    images: [],
  });

  const [screeningErrors, setScreeningErrors] = useState({});
  const [isSubmittingScreening, setIsSubmittingScreening] = useState(false);
  const [showScreeningForm, setShowScreeningForm] = useState(false);

  useEffect(() => { fetchTheaterLocations(); }, []);

  const fetchTheaterLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get('/api/theater-locations');
      let locationsData = [];
      if (response?.success && Array.isArray(response.data)) locationsData = response.data;
      else if (Array.isArray(response)) locationsData = response;
      else if (Array.isArray(response?.data)) locationsData = response.data;
      setLocations(locationsData);
      if (locationsData.length > 0) {
        const firstId = locationsData[0].id;
        setSelectedLocationId(firstId);
        fetchTheaters(firstId);
      }
    } catch (err) {
      console.error('Error fetching theater locations:', err);
      setError('Failed to load theater locations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTheaters = async (locationId, force = false) => {
    if (!force && theaters[locationId]) return;
    try {
      setLoadingTheaters(prev => ({ ...prev, [locationId]: true }));
      setTheatersError(prev => ({ ...prev, [locationId]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get(`/api/theaters/location/${locationId}`);
      let theatersData = [];
      if (response?.success && Array.isArray(response.data)) theatersData = response.data;
      else if (Array.isArray(response)) theatersData = response;
      else if (Array.isArray(response?.data)) theatersData = response.data;
      setTheaters(prev => ({ ...prev, [locationId]: theatersData }));
    } catch (err) {
      console.error('Error fetching theaters:', err);
      setTheatersError(prev => ({ ...prev, [locationId]: 'Failed to load theaters.' }));
    } finally {
      setLoadingTheaters(prev => ({ ...prev, [locationId]: false }));
    }
  };

  const fetchHalls = async (theaterId, force = false) => {
    if (!force && halls[theaterId]) return;
    try {
      setLoadingHalls(prev => ({ ...prev, [theaterId]: true }));
      setHallsError(prev => ({ ...prev, [theaterId]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get(`/api/halls/theater/${theaterId}`);
      let hallsData = [];
      if (response?.success && Array.isArray(response.data)) hallsData = response.data;
      else if (Array.isArray(response)) hallsData = response;
      else if (Array.isArray(response?.data)) hallsData = response.data;
      setHalls(prev => ({ ...prev, [theaterId]: hallsData }));
    } catch (err) {
      console.error('Error fetching halls:', err);
      setHallsError(prev => ({ ...prev, [theaterId]: 'Failed to load halls.' }));
    } finally {
      setLoadingHalls(prev => ({ ...prev, [theaterId]: false }));
    }
  };

  const fetchScreeningsByHall = async (hallId, force = false) => {
    if (!force && screeningsByHall[hallId]) return;
    try {
      setLoadingScreenings(prev => ({ ...prev, [hallId]: true }));
      setScreeningsError(prev => ({ ...prev, [hallId]: null }));
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const url = force ? `/api/screenings/hall/${hallId}?_=${Date.now()}` : `/api/screenings/hall/${hallId}`;
      const response = await apiClient.get(url);
      let data = [];
      if (response?.success && Array.isArray(response.data)) data = response.data;
      else if (Array.isArray(response)) data = response;
      else if (Array.isArray(response?.data)) data = response.data;
      setScreeningsByHall(prev => ({ ...prev, [hallId]: data }));
    } catch (err) {
      console.error('Error fetching screenings:', err);
      setScreeningsError(prev => ({ ...prev, [hallId]: 'Failed to load screenings.' }));
    } finally {
      setLoadingScreenings(prev => ({ ...prev, [hallId]: false }));
    }
  };

  const handleToggleHall = (hallId) => {
    if (expandedHallId === hallId) {
      setExpandedHallId(null);
    } else {
      setExpandedHallId(hallId);
      fetchScreeningsByHall(hallId);
    }
  };

  const handleAddTheaterSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addTheaterData.name.trim()) errors.name = 'Theater name is required';
    else if (addTheaterData.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (Object.keys(errors).length) { setAddTheaterErrors(errors); return; }

    setIsSubmittingTheater(true);
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const payload = {
        name: addTheaterData.name.trim(),
        description: addTheaterData.description?.trim() || '',
        locationId: selectedLocationId,
        adminUserId: user?.userId || user?.keycloakId || '',
      };
      await apiClient.post('/api/theaters', payload);
      await Swal.fire({ icon: 'success', title: 'Theater Added', text: 'Theater created successfully.', timer: 1500, showConfirmButton: false });
      setShowAddTheaterModal(false);
      setAddTheaterData({ name: '', description: '' });
      setAddTheaterErrors({});
      fetchTheaters(selectedLocationId, true);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to create theater.' });
    } finally {
      setIsSubmittingTheater(false);
    }
  };

  const handleAddHallSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addHallData.name.trim()) errors.name = 'Hall name is required';
    else if (addHallData.name.trim().length < 1) errors.name = 'Name must be at least 1 character';
    if (!addHallData.totalSeats) errors.totalSeats = 'Total seats is required';
    else if (isNaN(parseInt(addHallData.totalSeats)) || parseInt(addHallData.totalSeats) < 1) errors.totalSeats = 'Must be at least 1 seat';
    else if (parseInt(addHallData.totalSeats) > 1000) errors.totalSeats = 'Cannot exceed 1000 seats';
    if (Object.keys(errors).length) { setAddHallErrors(errors); return; }

    setIsSubmittingHall(true);
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      await apiClient.post('/api/halls', {
        name: addHallData.name.trim(),
        totalSeats: parseInt(addHallData.totalSeats),
        theaterId: selectedTheaterId,
      });
      await Swal.fire({ icon: 'success', title: 'Hall Added', text: 'Hall created successfully.', timer: 1500, showConfirmButton: false });
      setShowAddHallModal(false);
      setAddHallData({ name: '', totalSeats: '' });
      setAddHallErrors({});
      fetchHalls(selectedTheaterId, true);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to create hall.' });
    } finally {
      setIsSubmittingHall(false);
    }
  };

  const handleLocationSelect = (locationId) => {
    if (selectedLocationId === locationId) return;
    setSelectedLocationId(locationId);
    setSelectedTheaterId(null);
    fetchTheaters(locationId);
  };

  const handleTheaterSelect = (theaterId) => {
    if (selectedTheaterId === theaterId) return;
    setSelectedTheaterId(theaterId);
    fetchHalls(theaterId);
  };

  const handleAddScreening = (theaterId, theaterName, hallId, hallName) => {
    setScreeningFormData(prev => ({ ...prev, theaterId, theaterName, hallId, hallName }));
    setShowScreeningForm(true);
  };

  const handleScreeningInputChange = (field, value) => {
    setScreeningFormData(prev => ({ ...prev, [field]: value }));
    if (screeningErrors[field]) {
      setScreeningErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handleScreeningImageUpload = (e) => {
    const files = Array.from(e.target.files ?? []);
    const imageFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setScreeningFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageFiles],
    }));
    e.target.value = '';
  };

  const removeScreeningImage = (imageId) => {
    setScreeningFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const handleTimeChange = (value) => {
    setScreeningFormData(prev => ({ ...prev, startTime: value }));
    if (screeningErrors.startTime) {
      setScreeningErrors(prev => { const n = { ...prev }; delete n.startTime; return n; });
    }
  };

  const convertTo24HourFormat = (timeString) => {
    if (!timeString) return '00:00:00';
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    }
    return '00:00:00';
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const formatStartTime = (startTime) => {
    if (!startTime) return '—';
    if (typeof startTime === 'object') {
      const h = String(startTime.hour ?? 0).padStart(2, '0');
      const m = String(startTime.minute ?? 0).padStart(2, '0');
      return `${h}:${m}`;
    }
    return String(startTime).substring(0, 5);
  };

  const validateScreeningForm = () => {
    const newErrors = {};
    if (!screeningFormData.movieName.trim()) {
      newErrors.movieName = 'Movie name is required';
    } else if (screeningFormData.movieName.trim().length < 2) {
      newErrors.movieName = 'Movie name must be at least 2 characters';
    } else if (screeningFormData.movieName.trim().length > 200) {
      newErrors.movieName = 'Movie name must be less than 200 characters';
    }
    if (!screeningFormData.screeningDate.trim()) {
      newErrors.screeningDate = 'Screening date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(screeningFormData.screeningDate)) {
        newErrors.screeningDate = 'Please enter a valid date (YYYY-MM-DD)';
      } else {
        const selected = new Date(screeningFormData.screeningDate);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (isNaN(selected.getTime())) newErrors.screeningDate = 'Please enter a valid date';
        else if (selected < today) newErrors.screeningDate = 'Screening date cannot be in the past';
      }
    }
    if (!screeningFormData.startTime?.trim()) {
      newErrors.startTime = 'Start time is required';
    } else {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(screeningFormData.startTime)) newErrors.startTime = 'Please enter a valid time (HH:mm)';
    }
    if (!screeningFormData.theaterId) newErrors.theaterId = 'Theater selection is required';
    if (!screeningFormData.hallId) newErrors.hallId = 'Hall selection is required';
    if (screeningFormData.trailerLink.trim()) {
      try { new URL(screeningFormData.trailerLink); } catch { newErrors.trailerLink = 'Please enter a valid URL'; }
    }
    setScreeningErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScreeningSubmit = async (e) => {
    e.preventDefault();
    if (!validateScreeningForm()) {
      const firstErrorField = Object.keys(screeningErrors)[0];
      document.getElementById(`screening-${firstErrorField}`)?.focus();
      return;
    }
    setIsSubmittingScreening(true);
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);

      const dto = {
        movieName: screeningFormData.movieName.trim(),
        screeningDate: screeningFormData.screeningDate,
        startTime: convertTo24HourFormat(screeningFormData.startTime),
        trailerLink: screeningFormData.trailerLink.trim() || '',
        hallId: screeningFormData.hallId,
        hallName: screeningFormData.hallName,
        isActive: screeningFormData.isActive,
      };
      const posterFiles = screeningFormData.images.map((img) => img.file);
      const formDataToSend = buildScreeningFormData(dto, posterFiles);

      await apiClient.postFormData('/api/screenings', formDataToSend);
      await Swal.fire({ icon: 'success', title: 'Success!', text: 'Movie screening created successfully.', confirmButtonText: 'OK', confirmButtonColor: '#10b981' });
      const createdHallId = screeningFormData.hallId;
      handleScreeningReset();
      setShowScreeningForm(false);
      fetchScreeningsByHall(createdHallId, true);
      setExpandedHallId(createdHallId);
    } catch (error) {
      console.error('Error creating movie screening:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error?.response?.data?.message || 'Failed to create movie screening. Please try again.', confirmButtonText: 'OK' });
    } finally {
      setIsSubmittingScreening(false);
    }
  };

  const handleScreeningReset = () => {
    setScreeningFormData({
      movieName: '', screeningDate: '', startTime: '', trailerLink: '',
      theaterId: '', theaterName: '', hallId: '', hallName: '',
      isActive: true, images: [],
    });
    setScreeningErrors({});
  };

  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const selectedTheater = theaters[selectedLocationId]?.find(t => t.id === selectedTheaterId);
  const currentTheaters = theaters[selectedLocationId] ?? [];
  const currentHalls = halls[selectedTheaterId] ?? [];

  return (
    <PageWrapper
      title="Theater Management"
      description="Manage theaters, halls, and movie screenings."
    >
      {/* ── Explorer Layout ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row rounded-xl border border-border overflow-hidden bg-card" style={{ minHeight: '560px' }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col">

          {/* Locations */}
          <div className="p-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Locations</span>
              {loading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />}
            </div>

            {error ? (
              <div className="px-2 space-y-1">
                <p className="text-xs text-destructive">{error}</p>
                <button
                  type="button"
                  onClick={fetchTheaterLocations}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="space-y-1">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : locations.length === 0 ? (
              <p className="px-2 py-1 text-sm text-muted-foreground">No locations found.</p>
            ) : (
              <nav className="space-y-px">
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleLocationSelect(loc.id)}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      selectedLocationId === loc.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate leading-tight">{loc.dzongkhag}</p>
                      {loc.thromdoe && (
                        <p className={`text-xs truncate leading-tight ${
                          selectedLocationId === loc.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {loc.thromdoe}
                        </p>
                      )}
                    </div>
                    {selectedLocationId === loc.id && (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    )}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Theaters */}
          {selectedLocationId && (
            <div className="border-t border-border/50 p-3 flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center gap-1.5 px-2 mb-2">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Theaters</span>
                {loadingTheaters[selectedLocationId]
                  ? <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
                  : (
                    <button
                      type="button"
                      onClick={() => { setAddTheaterData({ name: '', description: '' }); setAddTheaterErrors({}); setShowAddTheaterModal(true); }}
                      className="ml-auto flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      title="Add theater"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )
                }
              </div>

              {theatersError[selectedLocationId] ? (
                <p className="px-2 py-1 text-xs text-destructive">{theatersError[selectedLocationId]}</p>
              ) : loadingTheaters[selectedLocationId] ? (
                <div className="space-y-1">
                  {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : currentTheaters.length === 0 ? (
                <p className="px-2 py-1 text-sm text-muted-foreground">No theaters.</p>
              ) : (
                <nav className="space-y-px">
                  {currentTheaters.map(theater => (
                    <button
                      key={theater.id}
                      type="button"
                      onClick={() => handleTheaterSelect(theater.id)}
                      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                        selectedTheaterId === theater.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        theater.isActive ? 'bg-green-500' : 'bg-muted-foreground/40'
                      }`} />
                      <span className="text-sm font-medium truncate flex-1">{theater.name}</span>
                      {selectedTheaterId === theater.id && (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      )}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          )}
        </aside>

        {/* ── MAIN PANEL ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Breadcrumb bar */}
          <div className="flex items-center gap-1.5 border-b border-border px-5 py-3 bg-card shrink-0">
            <Film className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className={`text-sm ${selectedLocationId ? 'text-foreground' : 'text-muted-foreground'}`}>
              {selectedLocation?.dzongkhag ?? 'No location selected'}
            </span>
            {selectedTheater && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">{selectedTheater.name}</span>
                <span className={`ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  selectedTheater.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {selectedTheater.isActive ? 'Active' : 'Inactive'}
                </span>
              </>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* Empty: no location */}
            {!selectedLocationId && !loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center select-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <MapPin className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Select a location</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                  Choose a location from the sidebar to get started.
                </p>
              </div>
            )}

            {/* Empty: no theater */}
            {selectedLocationId && !selectedTheaterId && (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center select-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Building className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Select a theater</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                  Pick a theater from the sidebar to see its halls.
                </p>
              </div>
            )}

            {/* Halls table */}
            {selectedTheaterId && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Halls</h2>
                  {!loadingHalls[selectedTheaterId] && currentHalls.length > 0 && (
                    <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                      {currentHalls.length}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto h-7 gap-1.5 text-xs px-3"
                    onClick={() => { setAddHallData({ name: '', totalSeats: '' }); setAddHallErrors({}); setShowAddHallModal(true); }}
                    disabled={loadingHalls[selectedTheaterId]}
                  >
                    <Plus className="h-3 w-3" />
                    Add Hall
                  </Button>
                </div>

                {loadingHalls[selectedTheaterId] ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
                ) : hallsError[selectedTheaterId] ? (
                  <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{hallsError[selectedTheaterId]}</p>
                  </div>
                ) : currentHalls.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-14 text-center">
                    <DoorOpen className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No halls in this theater.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="hidden sm:grid sm:grid-cols-[1fr_80px_160px] items-center gap-4 px-4 py-2 bg-muted/40 border-b border-border">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Hall</span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Seats</span>
                      <span />
                    </div>
                    <div className="divide-y divide-border">
                      {currentHalls.map(hall => {
                        const isExpanded = expandedHallId === hall.id;
                        const hallScreenings = screeningsByHall[hall.id] ?? [];
                        const isLoadingS = loadingScreenings[hall.id];
                        const sError = screeningsError[hall.id];
                        return (
                          <div key={hall.id}>
                            {/* Hall row */}
                            <div className="flex sm:grid sm:grid-cols-[1fr_80px_160px] items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                              <button
                                type="button"
                                onClick={() => handleToggleHall(hall.id)}
                                className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                                  {hall.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-sm font-medium text-foreground truncate block">{hall.name}</span>
                                  {screeningsByHall[hall.id] !== undefined && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {hallScreenings.length} screening{hallScreenings.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                              <div className="hidden sm:flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                                <Users className="h-3.5 w-3.5 shrink-0" />
                                <span>{hall.totalSeats}</span>
                              </div>
                              <div className="shrink-0 flex items-center sm:justify-end gap-2">
                                <span className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />{hall.totalSeats}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddScreening(selectedTheaterId, selectedTheater?.name, hall.id, hall.name)}
                                  className="h-7 gap-1.5 text-xs px-3"
                                >
                                  <Clapperboard className="h-3 w-3" />
                                  Add Screening
                                </Button>
                              </div>
                            </div>
                            {/* Screenings sub-list */}
                            {isExpanded && (
                              <div className="bg-muted/10 border-t border-border/50 px-4 py-3 space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Film className="h-3 w-3" /> Screenings
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => fetchScreeningsByHall(hall.id, true)}
                                    className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-1"
                                    disabled={isLoadingS}
                                  >
                                    <RefreshCw className={`h-2.5 w-2.5 ${isLoadingS ? 'animate-spin' : ''}`} />
                                    Refresh
                                  </button>
                                </div>
                                {isLoadingS ? (
                                  <div className="space-y-1.5">
                                    {[1, 2].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                                  </div>
                                ) : sError ? (
                                  <p className="text-xs text-destructive">{sError}</p>
                                ) : hallScreenings.length === 0 ? (
                                  <p className="text-xs text-muted-foreground py-2 text-center">No screenings yet. Click "Add Screening" to create one.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {hallScreenings.map((s, i) => (
                                      <div key={s.id ?? i} className="flex items-center justify-between rounded-md bg-card border border-border/60 px-3 py-2 text-xs gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Film className="h-3 w-3 shrink-0 text-muted-foreground" />
                                          <span className="font-medium text-foreground truncate">{s.movieName ?? '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 text-muted-foreground">
                                          <span>{s.screeningDate ?? '—'}</span>
                                          <span>{formatStartTime(s.startTime)}</span>
                                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                            s.isActive
                                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                              : 'bg-muted text-muted-foreground'
                                          }`}>
                                            {s.isActive ? 'Active' : 'Inactive'}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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
            <form onSubmit={handleAddHallSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-hall-name">Hall Name <span className="text-destructive">*</span></Label>
                <Input
                  id="add-hall-name"
                  placeholder="e.g. Hall A"
                  value={addHallData.name}
                  onChange={(e) => { setAddHallData(p => ({ ...p, name: e.target.value })); setAddHallErrors(p => { const n = {...p}; delete n.name; return n; }); }}
                  className={addHallErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                  autoFocus
                />
                {addHallErrors.name && (
                  <p role="alert" className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />{addHallErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-hall-seats">Total Seats <span className="text-destructive">*</span></Label>
                <Input
                  id="add-hall-seats"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="e.g. 120"
                  value={addHallData.totalSeats}
                  onChange={(e) => { setAddHallData(p => ({ ...p, totalSeats: e.target.value })); setAddHallErrors(p => { const n = {...p}; delete n.totalSeats; return n; }); }}
                  className={addHallErrors.totalSeats ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {addHallErrors.totalSeats && (
                  <p role="alert" className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />{addHallErrors.totalSeats}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddHallModal(false)} disabled={isSubmittingHall}>Cancel</Button>
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmittingHall}>
                  {isSubmittingHall ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</> : <><Plus className="h-4 w-4" />Add Hall</>}
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
                  <p className="text-xs text-muted-foreground">{locations.find(l => l.id === selectedLocationId)?.dzongkhag}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAddTheaterModal(false)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleAddTheaterSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-theater-name">Theater Name <span className="text-destructive">*</span></Label>
                <Input
                  id="add-theater-name"
                  placeholder="e.g. City Cineplex"
                  value={addTheaterData.name}
                  onChange={(e) => { setAddTheaterData(p => ({ ...p, name: e.target.value })); setAddTheaterErrors(p => { const n = {...p}; delete n.name; return n; }); }}
                  className={addTheaterErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                  autoFocus
                />
                {addTheaterErrors.name && (
                  <p role="alert" className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />{addTheaterErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-theater-desc">Description <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="add-theater-desc"
                  placeholder="Brief description of the theater"
                  value={addTheaterData.description}
                  onChange={(e) => setAddTheaterData(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddTheaterModal(false)} disabled={isSubmittingTheater}>Cancel</Button>
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmittingTheater}>
                  {isSubmittingTheater ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</> : <><Plus className="h-4 w-4" />Add Theater</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Screening Modal ───────────────────────────────────────────────── */}
      {showScreeningForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowScreeningForm(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl bg-card rounded-t-2xl md:rounded-2xl border shadow-2xl max-h-[92dvh] flex flex-col animate-in slide-in-from-bottom-8 duration-300">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Clapperboard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Schedule Screening</h2>
                  <p className="text-xs text-muted-foreground">
                    {screeningFormData.hallName} · {screeningFormData.theaterName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close form"
                onClick={() => setShowScreeningForm(false)}
                className="h-8 w-8 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <form id="screening-form" onSubmit={handleScreeningSubmit} className="space-y-5">

                {/* Context pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: MapPin, label: locations.find(l => l.id === selectedLocationId)?.dzongkhag },
                    { icon: Building, label: screeningFormData.theaterName },
                    { icon: DoorOpen, label: screeningFormData.hallName },
                  ].filter(p => p.label).map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Movie name */}
                <div className="space-y-1.5">
                  <Label htmlFor="screening-movieName">
                    Movie Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="screening-movieName"
                    placeholder="e.g. The Last Kingdom"
                    value={screeningFormData.movieName}
                    onChange={(e) => handleScreeningInputChange('movieName', e.target.value)}
                    className={screeningErrors.movieName ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  <FieldError message={screeningErrors.movieName} />
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="screening-screeningDate">
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="screening-screeningDate"
                      type="date"
                      value={screeningFormData.screeningDate}
                      onChange={(e) => handleScreeningInputChange('screeningDate', e.target.value)}
                      min={getMinDate()}
                      className={screeningErrors.screeningDate ? 'border-destructive' : ''}
                    />
                    <FieldError message={screeningErrors.screeningDate} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="screening-startTime">
                      Start Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="screening-startTime"
                      type="time"
                      value={screeningFormData.startTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className={screeningErrors.startTime ? 'border-destructive' : ''}
                    />
                    <FieldError message={screeningErrors.startTime} />
                  </div>
                </div>

                {/* Trailer URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="screening-trailerLink" className="flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Trailer URL
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="screening-trailerLink"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={screeningFormData.trailerLink}
                    onChange={(e) => handleScreeningInputChange('trailerLink', e.target.value)}
                    className={screeningErrors.trailerLink ? 'border-destructive' : ''}
                    autoComplete="off"
                  />
                  <FieldError message={screeningErrors.trailerLink} />
                </div>

                {/* Poster / screening images */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Movie Poster
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div
                    className="border-2 border-dashed border-border/60 rounded-xl p-5 text-center hover:border-primary/40 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('screening-images')?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs font-medium text-muted-foreground mb-1">Click to upload poster images</p>
                    <p className="text-[10px] text-muted-foreground/60 mb-3">PNG, JPG, WebP</p>
                    <input
                      id="screening-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleScreeningImageUpload}
                      className="hidden"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); document.getElementById('screening-images')?.click(); }}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Choose Images
                    </Button>
                  </div>
                  {screeningFormData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {screeningFormData.images.map((image) => (
                        <div key={image.id} className="relative group aspect-square">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover rounded-lg border border-border/60"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreeningImage(image.id)}
                            aria-label="Remove image"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Active Screening</p>
                    <p className="text-xs text-muted-foreground">Visible to customers when enabled.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={screeningFormData.isActive}
                    onClick={() => handleScreeningInputChange('isActive', !screeningFormData.isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      screeningFormData.isActive ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      screeningFormData.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowScreeningForm(false)}
                  disabled={isSubmittingScreening}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="screening-form"
                  className="flex-1 gap-2"
                  disabled={isSubmittingScreening}
                >
                  {isSubmittingScreening ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</>
                  ) : (
                    <><Clapperboard className="h-4 w-4" />Create Screening</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default TheaterPage;
