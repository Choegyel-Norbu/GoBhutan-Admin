import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Bed, Loader2, Edit, Trash2, Save, X, Plus, Upload, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { apiClient, api } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import { getRoomPrimaryImage, getRoomImageUrl } from '@/lib/utils';
import AuthenticatedImage from '@/components/AuthenticatedImage';
import Swal from 'sweetalert2';

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  
  // Edit functionality states
  const [editingRoom, setEditingRoom] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Add room functionality states
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
  const [addRoomFormData, setAddRoomFormData] = useState({
    roomNumber: '',
    roomTypeId: '',
    roomSize: '',
    floor: '',
    basePrice: '',
    maxOccupancy: '',
    status: 'AVAILABLE',
    isActive: true,
    description: '',
    images: []
  });
  const [addRoomErrors, setAddRoomErrors] = useState({});
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  
  // Delete functionality states - removed since using SweetAlert2

  // Fetch hotels first (no rooms until hotel is selected)
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        const token = authAPI.getStoredToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        
        console.log('Fetching hotels from:', API_CONFIG.ENDPOINTS.HOTEL.HOTELS);
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.HOTELS);
        console.log('Hotels response:', response);
        
        // Handle the new API response structure: { success, message, data: [...] }
        let hotelsData = [];
        if (response && response.success && Array.isArray(response.data)) {
          hotelsData = response.data;
        } else if (Array.isArray(response)) {
          hotelsData = response;
        } else if (response && Array.isArray(response.data)) {
          hotelsData = response.data;
        }
        
        console.log('Parsed hotels data:', hotelsData);
        setHotels(hotelsData);
        
        // Don't auto-select first hotel - let user choose
      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError('Failed to load hotels. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHotels();
  }, []);

  // Fetch room types for selected hotel
  useEffect(() => {
    if (!selectedHotelId) {
      setRoomTypes([]);
      return;
    }

    const fetchRoomTypes = async () => {
      try {
        setIsLoadingRoomTypes(true);
        const token = authAPI.getStoredToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.HOTEL.ROOM_TYPES_BY_HOTEL);
        
        let roomTypesData = [];
        if (response && Array.isArray(response)) {
          roomTypesData = response;
        } else if (response && response.success && Array.isArray(response.data)) {
          roomTypesData = response.data;
        } else if (response && Array.isArray(response.data)) {
          roomTypesData = response.data;
        }
        
        setRoomTypes(roomTypesData);
      } catch (error) {
        console.error('Error fetching room types:', error);
        setRoomTypes([]);
      } finally {
        setIsLoadingRoomTypes(false);
      }
    };

    fetchRoomTypes();
  }, [selectedHotelId]);

  // Fetch rooms when hotel is selected
  useEffect(() => {
    if (!selectedHotelId) {
      // Clear rooms when no hotel is selected
      setRooms([]);
      setError(null);
      return;
    }
    
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get stored token and set it on the API client
        const token = authAPI.getStoredToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        
        console.log('Fetching rooms for hotel:', selectedHotelId);
        
        // Use the dedicated room service method
        const response = await api.room.getRoomsByHotel(selectedHotelId);
        
        console.log('Rooms API Response Status:', response.status);
        console.log('Rooms API Response Data:', response);
        
        // Parse response data - new API structure: { success, message, data: [...] }
        const responseData = response.data || response;
        console.log('📦 Response type:', typeof responseData);
        console.log('📋 Response structure:', responseData);
        
        // Extract rooms from new API structure
        let roomsData = [];
        
        if (responseData.success && Array.isArray(responseData.data)) {
          console.log('✅ Success response with rooms array');
          roomsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          console.log('📋 Direct rooms array');
          roomsData = responseData;
        }
        
        console.log('🔍 Final rooms data:', roomsData);
        console.log(`📊 Extracted ${roomsData.length} rooms`);
        setRooms(roomsData);
        
      } catch (error) {
        console.error('Error fetching rooms:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          response: error.response,
          stack: error.stack
        });
        
        let errorMessage = 'Failed to fetch rooms. Please try again.';
        
        if (error.response) {
          errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || error.message}`;
        } else if (error.request) {
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          errorMessage = `Request error: ${error.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [selectedHotelId]);

  // Toast notification functions
  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage('');
    }, 3000);
  };

  // Edit room functions
  const handleEditRoom = (room) => {
    console.log('Editing room:', room);
    console.log('Room ID:', room.id, 'Type:', typeof room.id);
    
    if (!room || !room.id) {
      console.error('Cannot edit room: room or ID is missing', room);
      showToastNotification('Error: Cannot edit room. Room ID is missing.');
      return;
    }
    
    setEditingRoom(room);
    setEditFormData({
      roomNumber: room.roomNumber || '',
      floor: room.floor || '',
      basePrice: room.basePrice || '',
      maxOccupancy: room.maxOccupancy || '',
      status: room.status || 'AVAILABLE',
      isActive: room.isActive || true,
      description: room.description || '',
      existingImages: room.images || [], // Store existing images (current state)
      originalImages: room.images || [], // Store original images for comparison
      newImages: [] // Store newly uploaded images
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setEditFormData(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...imageFiles]
    }));
  };

  const removeEditImage = (imageId, isExisting = false) => {
    if (isExisting) {
      // Remove from existing images
      setEditFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter(img => img.id !== imageId)
      }));
    } else {
      // Remove from new images
      setEditFormData(prev => ({
        ...prev,
        newImages: prev.newImages.filter(img => img.id !== imageId)
      }));
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsEditLoading(true);
      
      // Validate that editingRoom and ID exist
      if (!editingRoom || !editingRoom.id) {
        console.error('Cannot update room: editingRoom or ID is missing', { editingRoom });
        showToastNotification('Error: Room ID is missing. Please try again.');
        return;
      }
      
      const roomId = editingRoom.id;
      console.log('Updating room with ID:', roomId, 'Room object:', editingRoom);
      
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      // Create FormData for form-data submission (like room creation)
      const formDataToSend = new FormData();
      
      // Add basic room information as flat form-data fields
      formDataToSend.append('roomNumber', editFormData.roomNumber.trim());
      if (editFormData.floor) {
        formDataToSend.append('floor', editFormData.floor.toString());
      }
      formDataToSend.append('basePrice', parseFloat(editFormData.basePrice).toString());
      formDataToSend.append('maxOccupancy', parseInt(editFormData.maxOccupancy).toString());
      formDataToSend.append('status', editFormData.status);
      formDataToSend.append('isActive', editFormData.isActive.toString());
      if (editFormData.description && editFormData.description.trim()) {
        formDataToSend.append('description', editFormData.description.trim());
      }
      
      // Add new room images as files with key "roomImages" (matches @RequestPart name)
      editFormData.newImages.forEach((image) => {
        formDataToSend.append('roomImages', image.file);
      });
      
      // Calculate deleted image IDs by comparing original images with current existing images
      // Backend expects @RequestParam(required = false, name = "deleteImageIds") List<Long> deleteImageIds
      // According to Swagger, deleteImageIds should be sent as query parameters, not form data
      const originalImageIds = (editFormData.originalImages || []).map(img => img.id).filter(id => id != null);
      const currentImageIds = (editFormData.existingImages || []).map(img => img.id).filter(id => id != null);
      const deletedImageIds = originalImageIds.filter(id => !currentImageIds.includes(id));
      
      console.log('Image deletion tracking:', {
        originalCount: originalImageIds.length,
        currentCount: currentImageIds.length,
        deletedCount: deletedImageIds.length,
        deletedIds: deletedImageIds
      });
      
      console.log('Update Room FormData:', formDataToSend);
      // Log form data entries for debugging
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value instanceof File ? value.name : value);
      }
      
      // Use putFormData for updating with FormData
      // Ensure roomId is a number (backend expects Long)
      const roomIdNumber = typeof roomId === 'string' ? parseInt(roomId, 10) : roomId;
      if (isNaN(roomIdNumber)) {
        console.error('Invalid room ID:', roomId);
        showToastNotification('Error: Invalid room ID. Please try again.');
        return;
      }
      
      // Build endpoint with query parameters for deleteImageIds (as per Swagger spec)
      let updateEndpoint = `/api/rooms/${roomIdNumber}`;
      if (deletedImageIds.length > 0) {
        // Add deleteImageIds as query parameters
        const queryParams = deletedImageIds.map(id => `deleteImageIds=${id}`).join('&');
        updateEndpoint = `${updateEndpoint}?${queryParams}`;
      }
      
      console.log('Making API call to update:', updateEndpoint);
      console.log('Room ID (original):', roomId, 'Room ID (parsed):', roomIdNumber);
      console.log('Delete Image IDs (query params):', deletedImageIds);
      
      const response = await apiClient.putFormData(updateEndpoint, formDataToSend);
      
      console.log('Edit room response:', response);
      console.log('Response success:', response.success);
      console.log('Response message:', response.message);
      console.log('Response data:', response.data);
      
      // Check for success response
      if (response && response.success) {
        // Refresh rooms list to get updated data
        const roomsResponse = await api.room.getRoomsByHotel(selectedHotelId);
        const responseData = roomsResponse.data || roomsResponse;
        let roomsData = [];
        
        if (responseData.success && Array.isArray(responseData.data)) {
          roomsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          roomsData = responseData;
        }
        
        setRooms(roomsData);
        
        // Close the edit modal
        setEditingRoom(null);
        setEditFormData({});
        
        // Show success toast
        showToastNotification('Room updated successfully');
        
        console.log('Room updated successfully');
      } else {
        console.log('Update failed - response:', response);
        console.log('Update failed - success:', response?.success);
        showToastNotification(`Failed to update room: ${response?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      
      // Check if the error has success response despite being thrown
      if (error.success) {
        // Refresh rooms list
        const roomsResponse = await api.room.getRoomsByHotel(selectedHotelId);
        const responseData = roomsResponse.data || roomsResponse;
        let roomsData = [];
        
        if (responseData.success && Array.isArray(responseData.data)) {
          roomsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          roomsData = responseData;
        }
        
        setRooms(roomsData);
        setEditingRoom(null);
        setEditFormData({});
        
        // Show success toast
        showToastNotification('Room updated successfully');
        
        console.log('Room updated successfully (despite error thrown)');
      } else {
        let errorMessage = 'Failed to update room. Please try again.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        showToastNotification(errorMessage);
      }
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Clean up object URLs for new images to prevent memory leaks
    if (editFormData.newImages && editFormData.newImages.length > 0) {
      editFormData.newImages.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    }
    setEditingRoom(null);
    setEditFormData({});
  };

  // Add room functions
  const handleToggleAddRoom = () => {
    setShowAddRoomForm(!showAddRoomForm);
    if (!showAddRoomForm) {
      // Opening form - reset form data
      setAddRoomFormData({
        roomNumber: '',
        roomTypeId: '',
        roomSize: '',
        floor: '',
        basePrice: '',
        maxOccupancy: '',
        status: 'AVAILABLE',
        isActive: true,
        description: '',
        images: []
      });
      setAddRoomErrors({});
    }
  };

  const handleCancelAddRoom = () => {
    setShowAddRoomForm(false);
    setAddRoomFormData({
      roomNumber: '',
      roomTypeId: '',
      floor: '',
      basePrice: '',
      maxOccupancy: '',
      status: 'AVAILABLE',
      isActive: true,
      description: '',
      images: []
    });
    setAddRoomErrors({});
  };

  const handleRoomImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setAddRoomFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  const removeRoomImage = (imageId) => {
    setAddRoomFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleAddRoomFormChange = (field, value) => {
    setAddRoomFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (addRoomErrors[field]) {
      setAddRoomErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateAddRoomForm = () => {
    const errors = {};
    
    if (!addRoomFormData.roomNumber.trim()) {
      errors.roomNumber = 'Room number is required';
    }
    
    if (!addRoomFormData.roomTypeId) {
      errors.roomTypeId = 'Room type is required';
    }
    
    if (!addRoomFormData.roomSize.trim()) {
      errors.roomSize = 'Room size is required';
    }
    
    if (!addRoomFormData.basePrice || isNaN(addRoomFormData.basePrice) || parseFloat(addRoomFormData.basePrice) <= 0) {
      errors.basePrice = 'Base price must be a positive number';
    }
    
    if (!addRoomFormData.maxOccupancy || isNaN(addRoomFormData.maxOccupancy) || parseInt(addRoomFormData.maxOccupancy) <= 0) {
      errors.maxOccupancy = 'Max occupancy must be a positive number';
    }
    
    setAddRoomErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitAddRoom = async (e) => {
    e.preventDefault();
    
    if (!validateAddRoomForm()) {
      return;
    }
    
    setIsSubmittingRoom(true);
    
    try {
      // Create FormData for form-data submission (like hotel creation)
      const formDataToSend = new FormData();
      
      // Add basic room information as flat form-data fields
      formDataToSend.append('hotelId', selectedHotelId.toString());
      formDataToSend.append('roomNumber', addRoomFormData.roomNumber.trim());
      // Send both camelCase and snake_case for room_type_id to ensure backend compatibility
      formDataToSend.append('roomTypeId', addRoomFormData.roomTypeId.toString());
      formDataToSend.append('room_type_id', addRoomFormData.roomTypeId.toString());
      formDataToSend.append('roomSize', addRoomFormData.roomSize.trim());
      if (addRoomFormData.floor) {
        formDataToSend.append('floor', addRoomFormData.floor.toString());
      }
      formDataToSend.append('basePrice', parseFloat(addRoomFormData.basePrice).toString());
      formDataToSend.append('maxOccupancy', parseInt(addRoomFormData.maxOccupancy).toString());
      formDataToSend.append('status', addRoomFormData.status);
      formDataToSend.append('isActive', addRoomFormData.isActive.toString());
      if (addRoomFormData.description.trim()) {
        formDataToSend.append('description', addRoomFormData.description.trim());
      }
      
      // Add room images as files with key "roomImages" (similar to hotelImages)
      addRoomFormData.images.forEach((image) => {
        formDataToSend.append('roomImages', image.file);
      });
      
      console.log('Room FormData:', formDataToSend);
      // Log form data entries for debugging
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value instanceof File ? value.name : value);
      }
      
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      // Make API call to POST /rooms with FormData
      console.log('Making API call to:', API_CONFIG.ENDPOINTS.HOTEL.ALL_ROOMS);
      
      const response = await apiClient.postFormData(API_CONFIG.ENDPOINTS.HOTEL.ALL_ROOMS, formDataToSend);
      
      console.log('Create room response:', response);
      
      if (response && response.success === true) {
        // Refresh rooms list
        const roomsResponse = await api.room.getRoomsByHotel(selectedHotelId);
        const responseData = roomsResponse.data || roomsResponse;
        let roomsData = [];
        
        if (responseData.success && Array.isArray(responseData.data)) {
          roomsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          roomsData = responseData;
        }
        
        setRooms(roomsData);
        
        // Reset form and hide it
        handleCancelAddRoom();
        
        await Swal.fire({
          icon: 'success',
          title: 'Room Added Successfully!',
          text: response.message || `Room ${addRoomFormData.roomNumber} has been added successfully.`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981'
        });
      } else {
        throw new Error(response?.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to create room. Please try again or contact support.';
      
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
      
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Create Room',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  // Delete room functions
  const handleDeleteRoom = async (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    const roomName = room?.roomNumber || `Room ID: ${roomId}`;
    
    // Show confirmation dialog with SweetAlert2
    const result = await Swal.fire({
      title: 'Delete Room?',
      text: `Are you sure you want to delete ${roomName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      await confirmDelete(roomId, roomName);
    }
  };

  const confirmDelete = async (roomId, roomName) => {
    try {
      // Show loading state
      Swal.fire({
        title: 'Deleting Room...',
        text: 'Please wait while we delete the room.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      // Use the dedicated room service method
      const response = await api.room.deleteRoom(roomId);
      
      console.log('Delete room response:', response);
      console.log('Response type:', typeof response);
      console.log('Response structure:', response);
      
      // With the improved apiClient, successful DELETE requests will always return a success object
      // or the actual response data. Since we reached here without throwing, it's successful.
      
      // Remove the deleted room from the list
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Room Deleted!',
        text: `${roomName} has been successfully deleted.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });
      
      console.log('Room deleted successfully');
      
    } catch (error) {
      console.error('Error deleting room:', error);
      
      // Show error message
      let errorMessage = 'Failed to delete room. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <PageWrapper
      title="Room Management"
      description="Manage rooms for existing hotels"
    >

      {/* Hotel Selection */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="hotel-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Hotel
            </Label>
            <Select
              id="hotel-select"
              value={selectedHotelId || ''}
              onChange={(e) => setSelectedHotelId(e.target.value)}
            >
              <option value="">Choose a hotel…</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {selectedHotelId ? 'Loading rooms…' : 'Loading hotels…'}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && !selectedHotelId && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bed className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No hotel selected</p>
          <p className="text-xs mt-1">Select a hotel above to view its rooms.</p>
        </div>
      )}

      {/* Rooms List */}
      {!isLoading && !error && selectedHotelId && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Bed className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {hotels.find(h => h.id === parseInt(selectedHotelId))?.name || 'Selected Hotel'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {rooms.length} room{rooms.length !== 1 ? 's' : ''} registered
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={handleToggleAddRoom}
                size="sm"
                variant={showAddRoomForm ? "outline" : "default"}
                className="flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                {showAddRoomForm ? 'Cancel' : 'Add Room'}
              </Button>
            </div>
          </CardHeader>

          {rooms.length === 0 ? (
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Bed className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No rooms found</p>
                <p className="text-xs mt-1 mb-4">No rooms are currently registered for this hotel.</p>
                <Button
                  onClick={handleToggleAddRoom}
                  size="sm"
                  variant={showAddRoomForm ? "outline" : "default"}
                  className="flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showAddRoomForm ? 'Cancel' : 'Add First Room'}
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent className="pt-0 px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Image</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Room #</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Hotel</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Room Type</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Floor</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Base Price</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Max Occ.</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Status</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Active</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Description</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Created</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rooms.map((room, index) => {
                      const roomImageUrl = getRoomPrimaryImage(room.images);
                      return (
                        <tr key={room.id || index} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                              {roomImageUrl ? (
                                <AuthenticatedImage
                                  src={roomImageUrl}
                                  alt={`Room ${room.roomNumber || 'N/A'}`}
                                  className="w-full h-full object-cover"
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
                                className="w-full h-full bg-primary/5 flex items-center justify-center"
                                style={{ display: roomImageUrl ? 'none' : 'flex' }}
                              >
                                <Bed className="h-5 w-5 text-primary/40" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-foreground">{room.roomNumber || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-muted-foreground">{room.hotelName || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-foreground">{room.roomTypeName || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-muted-foreground">{room.floor || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-primary">Nu {room.basePrice || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-muted-foreground">{room.maxOccupancy || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              room.status === 'AVAILABLE' ? 'bg-primary/10 text-primary' :
                              room.status === 'OCCUPIED' ? 'bg-destructive/10 text-destructive' :
                              room.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-700' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {room.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              room.isActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                            }`}>
                              {room.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-muted-foreground truncate block max-w-32 md:max-w-48">
                              {room.description || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs text-muted-foreground">
                              {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRoom(room)}
                                aria-label="Edit room"
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRoom(room.id)}
                                aria-label="Delete room"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Add Room Form Section */}
      {!isLoading && !error && selectedHotelId && showAddRoomForm && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Add New Room</CardTitle>
                <CardDescription className="text-xs">Fill in the details below to add a new room to this hotel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAddRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="roomNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={addRoomFormData.roomNumber}
                    onChange={(e) => handleAddRoomFormChange('roomNumber', e.target.value)}
                    placeholder="e.g., 101"
                    className={addRoomErrors.roomNumber ? 'border-destructive' : ''}
                    disabled={isSubmittingRoom}
                  />
                  {addRoomErrors.roomNumber && (
                    <p className="text-xs text-destructive">{addRoomErrors.roomNumber}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="roomTypeId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room Type *</Label>
                  <Select
                    id="roomTypeId"
                    value={addRoomFormData.roomTypeId}
                    onChange={(e) => handleAddRoomFormChange('roomTypeId', e.target.value)}
                    className={addRoomErrors.roomTypeId ? 'border-destructive' : ''}
                    disabled={isSubmittingRoom || isLoadingRoomTypes}
                  >
                    <option value="">Select room type...</option>
                    {roomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
                    ))}
                  </Select>
                  {addRoomErrors.roomTypeId && (
                    <p className="text-xs text-destructive">{addRoomErrors.roomTypeId}</p>
                  )}
                  {isLoadingRoomTypes && (
                    <p className="text-xs text-muted-foreground">Loading room types…</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="roomSize" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room Size *</Label>
                  <Input
                    id="roomSize"
                    value={addRoomFormData.roomSize}
                    onChange={(e) => handleAddRoomFormChange('roomSize', e.target.value)}
                    placeholder="e.g., 250 sq ft"
                    className={addRoomErrors.roomSize ? 'border-destructive' : ''}
                    disabled={isSubmittingRoom}
                  />
                  {addRoomErrors.roomSize && (
                    <p className="text-xs text-destructive">{addRoomErrors.roomSize}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="floor" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={addRoomFormData.floor}
                    onChange={(e) => handleAddRoomFormChange('floor', e.target.value)}
                    placeholder="e.g., 1"
                    disabled={isSubmittingRoom}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="basePrice" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base Price (Nu) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={addRoomFormData.basePrice}
                    onChange={(e) => handleAddRoomFormChange('basePrice', e.target.value)}
                    placeholder="e.g., 2999.99"
                    className={addRoomErrors.basePrice ? 'border-destructive' : ''}
                    disabled={isSubmittingRoom}
                  />
                  {addRoomErrors.basePrice && (
                    <p className="text-xs text-destructive">{addRoomErrors.basePrice}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxOccupancy" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Occupancy *</Label>
                  <Input
                    id="maxOccupancy"
                    type="number"
                    value={addRoomFormData.maxOccupancy}
                    onChange={(e) => handleAddRoomFormChange('maxOccupancy', e.target.value)}
                    placeholder="e.g., 2"
                    className={addRoomErrors.maxOccupancy ? 'border-destructive' : ''}
                    disabled={isSubmittingRoom}
                  />
                  {addRoomErrors.maxOccupancy && (
                    <p className="text-xs text-destructive">{addRoomErrors.maxOccupancy}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
                  <Select
                    id="status"
                    value={addRoomFormData.status}
                    onChange={(e) => handleAddRoomFormChange('status', e.target.value)}
                    disabled={isSubmittingRoom}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OUT_OF_ORDER">Out of Order</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="isActive" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Status</Label>
                  <Select
                    id="isActive"
                    value={addRoomFormData.isActive.toString()}
                    onChange={(e) => handleAddRoomFormChange('isActive', e.target.value === 'true')}
                    disabled={isSubmittingRoom}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={addRoomFormData.description}
                  onChange={(e) => handleAddRoomFormChange('description', e.target.value)}
                  placeholder="Room description..."
                  rows={3}
                  disabled={isSubmittingRoom}
                />
              </div>

              {/* Room Images */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room Images</Label>
                <div
                  className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/40 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => !isSubmittingRoom && document.getElementById('roomImages').click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Drag and drop images here, or click to select</p>
                  <p className="text-xs text-muted-foreground/60">JPEG, PNG, WebP supported</p>
                  <input
                    id="roomImages"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleRoomImageUpload}
                    className="hidden"
                    disabled={isSubmittingRoom}
                  />
                </div>

                {addRoomFormData.images.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs text-muted-foreground">{addRoomFormData.images.length} image{addRoomFormData.images.length !== 1 ? 's' : ''} selected</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {addRoomFormData.images.map((image) => (
                        <div key={image.id} className="relative group aspect-square">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover rounded-lg border border-border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeRoomImage(image.id)}
                              disabled={isSubmittingRoom}
                              className="p-1.5 bg-destructive text-white rounded-md hover:bg-destructive/90"
                              aria-label="Remove image"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingRoom}
                  className="flex items-center gap-2"
                >
                  {isSubmittingRoom ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  {isSubmittingRoom ? 'Adding…' : 'Add Room'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCancelAddRoom}
                  variant="outline"
                  disabled={isSubmittingRoom}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Edit className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Edit Room</h3>
              </div>
              <button
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-roomNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room Number</Label>
                  <Input
                    id="edit-roomNumber"
                    value={editFormData.roomNumber}
                    onChange={(e) => handleEditFormChange('roomNumber', e.target.value)}
                    placeholder="e.g., 101"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-floor" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Floor</Label>
                  <Input
                    id="edit-floor"
                    type="number"
                    value={editFormData.floor}
                    onChange={(e) => handleEditFormChange('floor', parseInt(e.target.value))}
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-basePrice" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base Price (Nu)</Label>
                  <Input
                    id="edit-basePrice"
                    type="number"
                    step="0.01"
                    value={editFormData.basePrice}
                    onChange={(e) => handleEditFormChange('basePrice', parseFloat(e.target.value))}
                    placeholder="e.g., 2999.99"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-maxOccupancy" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Occupancy</Label>
                  <Input
                    id="edit-maxOccupancy"
                    type="number"
                    value={editFormData.maxOccupancy}
                    onChange={(e) => handleEditFormChange('maxOccupancy', parseInt(e.target.value))}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
                  <Select
                    id="edit-status"
                    value={editFormData.status}
                    onChange={(e) => handleEditFormChange('status', e.target.value)}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OUT_OF_ORDER">Out of Order</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-isActive" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Status</Label>
                  <Select
                    id="edit-isActive"
                    value={editFormData.isActive.toString()}
                    onChange={(e) => handleEditFormChange('isActive', e.target.value === 'true')}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Room description..."
                  rows={3}
                />
              </div>

              {/* Room Images Section */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room Images</Label>

                {/* Existing Images Preview */}
                {editFormData.existingImages && editFormData.existingImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Existing ({editFormData.existingImages.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {editFormData.existingImages.map((image) => {
                        const imageUrl = image.url ? getRoomImageUrl(image.url) : null;
                        return (
                          <div key={image.id} className="relative group aspect-square">
                            {imageUrl ? (
                              <AuthenticatedImage
                                src={imageUrl}
                                alt={image.title || `Room image ${image.id}`}
                                className="w-full h-full object-cover rounded-lg border border-border"
                                onError={(e) => {
                                  const imgElement = e.target;
                                  if (imgElement) {
                                    imgElement.style.display = 'none';
                                    const nextSibling = imgElement.nextSibling;
                                    if (nextSibling) nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted rounded-lg border border-border flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeEditImage(image.id, true)}
                                disabled={isEditLoading}
                                className="p-1.5 bg-destructive text-white rounded-md hover:bg-destructive/90"
                                aria-label="Remove image"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div
                  className="border-2 border-dashed border-border/60 rounded-xl p-5 text-center hover:border-primary/40 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => !isEditLoading && document.getElementById('editRoomImages').click()}
                >
                  <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Click to add new images</p>
                  <input
                    id="editRoomImages"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="hidden"
                    disabled={isEditLoading}
                  />
                </div>

                {/* New Images Preview */}
                {editFormData.newImages && editFormData.newImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">New ({editFormData.newImages.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {editFormData.newImages.map((image) => (
                        <div key={image.id} className="relative group aspect-square">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover rounded-lg border border-border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeEditImage(image.id, false)}
                              disabled={isEditLoading}
                              className="p-1.5 bg-destructive text-white rounded-md hover:bg-destructive/90"
                              aria-label="Remove image"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-4 border-t border-border">
              <Button
                onClick={handleSaveEdit}
                size="sm"
                disabled={isEditLoading}
                className="flex items-center gap-2"
              >
                {isEditLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Changes
              </Button>
              <Button
                onClick={handleCancelEdit}
                size="sm"
                variant="outline"
                disabled={isEditLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm ${
            toastMessage.includes('successfully') || toastMessage.includes('success')
              ? 'bg-background border-primary/20'
              : 'bg-background border-destructive/20'
          }`}>
            <div className={`shrink-0 ${
              toastMessage.includes('successfully') || toastMessage.includes('success')
                ? 'text-primary'
                : 'text-destructive'
            }`}>
              {toastMessage.includes('successfully') || toastMessage.includes('success') ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground flex-1">{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </PageWrapper>
  );
};

export default RoomManager;

