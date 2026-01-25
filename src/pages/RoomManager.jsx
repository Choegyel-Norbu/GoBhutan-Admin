import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Bed, Loader2, Edit, Trash2, Save, X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { apiClient, api } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';
import { getRoomPrimaryImage, getRoomImageUrl } from '@/lib/utils';
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
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold">Room Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage rooms for existing hotels</p>
        </div>
      </div>

      {/* Hotel Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base md:text-lg">Select Hotel</CardTitle>
          <CardDescription className="text-sm">
            Choose a hotel to view and manage its rooms
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full max-w-md">
            <Label htmlFor="hotel-select" className="text-sm font-medium">Hotel</Label>
            <Select
              id="hotel-select"
              value={selectedHotelId || ''}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="mt-1"
            >
              <option value="">Select a hotel...</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{selectedHotelId ? 'Loading rooms...' : 'Loading hotels...'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Hotel Selected State */}
      {!isLoading && !error && !selectedHotelId && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No hotel selected</p>
              <p className="text-sm mt-1">Please select a hotel above to view its rooms.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rooms List */}
      {!isLoading && !error && selectedHotelId && (
        <Card>
          <CardHeader className="pb-4">
            {/* Selected Hotel Display */}
            {selectedHotelId && (
              <div className="flex items-center justify-between mb-2">
                <div className="text-center flex-1">
                <h3 className="text-base md:text-lg font-semibold text-primary">
                  {hotels.find(h => h.id === parseInt(selectedHotelId))?.name || 'Selected Hotel'}
                </h3>
                </div>
                <Button
                  onClick={handleToggleAddRoom}
                  className="flex items-center gap-2"
                  size="sm"
                  variant={showAddRoomForm ? "outline" : "default"}
                >
                  <Plus className="h-4 w-4" />
                  {showAddRoomForm ? 'Cancel' : 'Add Room'}
                </Button>
              </div>
            )}
            <CardTitle className="text-sm md:text-base">
              All rooms
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {selectedHotelId ? 'Rooms for the selected hotel' : 'Select a hotel to view rooms'}
            </CardDescription>
          </CardHeader>

          {rooms.length === 0 ? (
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No rooms found</p>
                <p className="text-sm mt-1 mb-4">No rooms are currently registered for this hotel.</p>
                <Button
                  onClick={handleToggleAddRoom}
                  className="flex items-center gap-2 mx-auto"
                  size="sm"
                  variant={showAddRoomForm ? "outline" : "default"}
                >
                  <Plus className="h-4 w-4" />
                  {showAddRoomForm ? 'Cancel' : 'Add First Room'}
                </Button>
              </div>
            </CardContent>
          ) : (

          <CardContent className="pt-0">
            {/* Table with horizontal scroll on mobile */}
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-full px-4 md:px-0">
                <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Image</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Room #</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Hotel</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Room Type</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Floor</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Base Price</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Max Occupancy</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Status</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Active</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Description</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Created</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>


                <tbody className="divide-y divide-gray-200">
                  {rooms.map((room, index) => {
                    const roomImageUrl = getRoomPrimaryImage(room.images);
                    return (
                    <tr key={room.id || index} className="hover:bg-gray-50">
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded overflow-hidden bg-gray-100">
                          {roomImageUrl ? (
                            <img
                              src={roomImageUrl}
                              alt={`Room ${room.roomNumber || 'N/A'}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                            style={{ display: roomImageUrl ? 'none' : 'flex' }}
                          >
                            <Bed className="h-5 w-5 md:h-6 md:w-6 text-primary/40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {room.roomNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <span className="text-gray-700">{room.hotelName || 'N/A'}</span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{room.roomTypeName || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <span className="text-gray-700">{room.floor || 'N/A'}</span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <span className="font-medium text-green-600">
                          Nu {room.basePrice || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <span className="text-gray-700">{room.maxOccupancy || 'N/A'}</span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <span className={`px-1 md:px-2 py-1 text-xs rounded-full font-medium ${
                          room.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                          room.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' :
                          room.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                          room.status === 'OUT_OF_ORDER' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {room.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <span className={`px-1 md:px-2 py-1 text-xs rounded-full font-medium ${
                          room.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3">
                        <div className="max-w-32 md:max-w-48">
                          <span className="text-xs text-gray-600 truncate block">
                            {room.description || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <span className="text-xs text-gray-500">
                          {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 md:gap-2">
                          <button 
                            onClick={() => handleEditRoom(room)}
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                            title="Edit room"
                          >
                            <Edit className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                            title="Delete room"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
            
            {/* Room Description Panel */}
            <div className="mt-4 md:mt-6">
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h4 className="text-xs md:text-sm font-medium text-gray-700 mb-2">Room Details</h4>
                <div className="text-xs text-gray-600">
                  Click on any row to view detailed room descriptions and additional information.
                </div>
              </div>
            </div>
          </CardContent>
          )}
        </Card>
      )}

      {/* Add Room Form Section */}
      {!isLoading && !error && selectedHotelId && showAddRoomForm && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Room
            </CardTitle>
            <CardDescription className="text-sm">
              Fill in the details below to add a new room to this hotel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAddRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber" className="text-sm font-medium">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={addRoomFormData.roomNumber}
                    onChange={(e) => handleAddRoomFormChange('roomNumber', e.target.value)}
                    placeholder="e.g., 101"
                    className={addRoomErrors.roomNumber ? 'border-red-500' : ''}
                    disabled={isSubmittingRoom}
                  />
                  {addRoomErrors.roomNumber && (
                    <p className="text-xs text-red-500 mt-1">{addRoomErrors.roomNumber}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roomTypeId" className="text-sm font-medium">Room Type *</Label>
                  <Select
                    id="roomTypeId"
                    value={addRoomFormData.roomTypeId}
                    onChange={(e) => handleAddRoomFormChange('roomTypeId', e.target.value)}
                    className={addRoomErrors.roomTypeId ? 'border-red-500' : ''}
                    disabled={isSubmittingRoom || isLoadingRoomTypes}
                  >
                    <option value="">Select room type...</option>
                    {roomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </option>
                    ))}
                  </Select>
                  {addRoomErrors.roomTypeId && (
                    <p className="text-xs text-red-500 mt-1">{addRoomErrors.roomTypeId}</p>
                  )}
                  {isLoadingRoomTypes && (
                    <p className="text-xs text-gray-500 mt-1">Loading room types...</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roomSize" className="text-sm font-medium">Room Size *</Label>
                  <Input
                    id="roomSize"
                    value={addRoomFormData.roomSize}
                    onChange={(e) => handleAddRoomFormChange('roomSize', e.target.value)}
                    placeholder="e.g., 250 sq ft"
                    className={addRoomErrors.roomSize ? 'border-red-500' : ''}
                    disabled={isSubmittingRoom}
                  />
                  {addRoomErrors.roomSize && (
                    <p className="text-xs text-red-500 mt-1">{addRoomErrors.roomSize}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="floor" className="text-sm font-medium">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={addRoomFormData.floor}
                    onChange={(e) => handleAddRoomFormChange('floor', e.target.value)}
                    placeholder="e.g., 1"
                    disabled={isSubmittingRoom}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="text-sm font-medium">Base Price (Nu) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={addRoomFormData.basePrice}
                    onChange={(e) => handleAddRoomFormChange('basePrice', e.target.value)}
                    placeholder="e.g., 2999.99"
                    className={addRoomErrors.basePrice ? 'border-red-500' : ''}
                    disabled={isSubmittingRoom}
                  />
                  {addRoomErrors.basePrice && (
                    <p className="text-xs text-red-500 mt-1">{addRoomErrors.basePrice}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxOccupancy" className="text-sm font-medium">Max Occupancy *</Label>
                  <Input
                    id="maxOccupancy"
                    type="number"
                    value={addRoomFormData.maxOccupancy}
                    onChange={(e) => handleAddRoomFormChange('maxOccupancy', e.target.value)}
                    placeholder="e.g., 2"
                    className={addRoomErrors.maxOccupancy ? 'border-red-500' : ''}
                    disabled={isSubmittingRoom}
                  />
                  {addRoomErrors.maxOccupancy && (
                    <p className="text-xs text-red-500 mt-1">{addRoomErrors.maxOccupancy}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
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
                <Label htmlFor="roomImages" className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Room Images
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop images here, or click to select files
                  </p>
                  <input
                    id="roomImages"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleRoomImageUpload}
                    className="hidden"
                    disabled={isSubmittingRoom}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('roomImages').click()}
                    disabled={isSubmittingRoom}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                  </Button>
                </div>
                
                {addRoomFormData.images.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Selected Images ({addRoomFormData.images.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {addRoomFormData.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeRoomImage(image.id)}
                              disabled={isSubmittingRoom}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit"
                  disabled={isSubmittingRoom}
                  className="flex items-center justify-center gap-2"
                >
                  {isSubmittingRoom ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isSubmittingRoom ? 'Adding Room...' : 'Add Room'}
                </Button>
                <Button 
                  type="button"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-semibold">Edit Room</h3>
              <button 
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="roomNumber" className="text-sm font-medium">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={editFormData.roomNumber}
                  onChange={(e) => handleEditFormChange('roomNumber', e.target.value)}
                  placeholder="e.g., 101"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="floor" className="text-sm font-medium">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  value={editFormData.floor}
                  onChange={(e) => handleEditFormChange('floor', parseInt(e.target.value))}
                  placeholder="e.g., 1"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="basePrice" className="text-sm font-medium">Base Price ($)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={editFormData.basePrice}
                  onChange={(e) => handleEditFormChange('basePrice', parseFloat(e.target.value))}
                  placeholder="e.g., 99.99"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="maxOccupancy" className="text-sm font-medium">Max Occupancy</Label>
                <Input
                  id="maxOccupancy"
                  type="number"
                  value={editFormData.maxOccupancy}
                  onChange={(e) => handleEditFormChange('maxOccupancy', parseInt(e.target.value))}
                  placeholder="e.g., 2"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => handleEditFormChange('status', e.target.value)}
                  className="mt-1"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_ORDER">Out of Order</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
                <Select
                  id="isActive"
                  value={editFormData.isActive.toString()}
                  onChange={(e) => handleEditFormChange('isActive', e.target.value === 'true')}
                  className="mt-1"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Room description..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              {/* Room Images Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Room Images
                </Label>
                
                {/* Existing Images Preview */}
                {editFormData.existingImages && editFormData.existingImages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Existing Images ({editFormData.existingImages.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {editFormData.existingImages.map((image) => {
                        const imageUrl = image.url ? getRoomImageUrl(image.url) : null;
                        return (
                          <div key={image.id} className="relative group">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={image.title || `Room image ${image.id}`}
                                className="w-full h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-24 bg-gray-100 rounded-lg border flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeEditImage(image.id, true)}
                                disabled={isEditLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {image.title && (
                              <p className="text-xs text-gray-500 mt-1 truncate">{image.title}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Upload New Images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-2">
                    Add new images
                  </p>
                  <input
                    id="editRoomImages"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="hidden"
                    disabled={isEditLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('editRoomImages').click()}
                    disabled={isEditLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                  </Button>
                </div>
                
                {/* New Images Preview */}
                {editFormData.newImages && editFormData.newImages.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-xs text-gray-600">New Images ({editFormData.newImages.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {editFormData.newImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeEditImage(image.id, false)}
                              disabled={isEditLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4">
                <Button 
                  onClick={handleSaveEdit}
                  disabled={isEditLoading}
                  className="flex items-center justify-center gap-2 py-2 px-4 text-sm"
                >
                  {isEditLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
                <Button 
                  onClick={handleCancelEdit}
                  variant="outline"
                  disabled={isEditLoading}
                  className="py-2 px-4 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white max-w-sm ${
            toastMessage.includes('successfully') || toastMessage.includes('success') 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{toastMessage}</span>
              <button 
                onClick={() => setShowToast(false)}
                className="ml-4 text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoomManager;

