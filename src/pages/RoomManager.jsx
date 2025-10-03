import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Bed, Loader2, Edit, Trash2, Save, X } from 'lucide-react';
import { apiClient } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import authAPI from '@/lib/authAPI';

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
  
  // Delete functionality states
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

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
        
        const hotelsData = response.data || response;
        setHotels(Array.isArray(hotelsData) ? hotelsData : []);
        
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
        
        // Use the hotel-specific endpoint: /room/hotel/{hotelId}
        const endpoint = `/rooms/hotel/${selectedHotelId}`;
        
        console.log('Fetching rooms from:', endpoint);
        
        const response = await apiClient.get(endpoint);
        
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
    setEditingRoom(room);
    setEditFormData({
      roomNumber: room.roomNumber || '',
      floor: room.floor || '',
      basePrice: room.basePrice || '',
      maxOccupancy: room.maxOccupancy || '',
      status: room.status || 'AVAILABLE',
      isActive: room.isActive || true,
      description: room.description || ''
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setIsEditLoading(true);
      
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      const response = await apiClient.put(`/rooms/${editingRoom.id}`, editFormData);
      
      console.log('Edit room response:', response);
      console.log('Response success:', response.success);
      console.log('Response message:', response.message);
      console.log('Response data:', response.data);
      
      // Check for success response
      if (response.success) {
        // Update the rooms list with the updated room data from API response
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === editingRoom.id 
              ? { ...room, ...response.data }
              : room
          )
        );
        
        // Close the edit modal
        setEditingRoom(null);
        setEditFormData({});
        
        // Show success toast
        showToastNotification('Room updated successfully');
        
        console.log('Room updated successfully');
      } else {
        console.log('Update failed - response:', response);
        console.log('Update failed - success:', response.success);
        showToastNotification(`Failed to update room: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      
      // Check if the error has success response despite being thrown
      if (error.success) {
        // Update the rooms list with API response data even if an error was thrown
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === editingRoom.id 
              ? { ...room, ...error.data }
              : room
          )
        );
        
        setEditingRoom(null);
        setEditFormData({});
        
        // Show success toast
        showToastNotification('Room updated successfully');
        
        console.log('Room updated successfully (despite error thrown)');
      } else {
        showToastNotification(`Failed to update room: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRoom(null);
    setEditFormData({});
  };

  // Delete room functions
  const handleDeleteRoom = (roomId) => {
    setDeletingRoomId(roomId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleteLoading(true);
      
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      const response = await apiClient.delete(`/rooms/${deletingRoomId}`);
      
      console.log('Delete room response:', response);
      
      // Check for HTTP 200 status
      if (response.status === 200) {
        // Remove the deleted room from the list
        setRooms(prevRooms => prevRooms.filter(room => room.id !== deletingRoomId));
        setShowDeleteConfirm(false);
        setDeletingRoomId(null);
        
        console.log('Room deleted successfully');
      } else {
        setError(response.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      
      // Check if the error has HTTP 200 status despite being thrown
      if (error.response?.status === 200) {
        // Remove the room even if an error was thrown but status is 200
        setRooms(prevRooms => prevRooms.filter(room => room.id !== deletingRoomId));
        setShowDeleteConfirm(false);
        setDeletingRoomId(null);
        
        console.log('Room deleted successfully (despite error thrown)');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to delete room');
      }
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingRoomId(null);
  };

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bed className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage rooms for existing hotels</p>
        </div>
      </div>

      {/* Hotel Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Hotel</CardTitle>
          <CardDescription>
            Choose a hotel to view and manage its rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="hotel-select">Hotel</Label>
            <Select
              id="hotel-select"
              value={selectedHotelId || ''}
              onChange={(e) => setSelectedHotelId(e.target.value)}
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
      {!isLoading && !error && selectedHotelId && rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Rooms - {hotels.find(h => h.id === selectedHotelId)?.name || 'Selected Hotel'} ({rooms.length} rooms)
            </CardTitle>
            <CardDescription>
              {selectedHotelId ? 'Rooms for the selected hotel' : 'Select a hotel to view rooms'}
            </CardDescription>
          </CardHeader>


          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Room #</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Hotel</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Room Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Floor</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Base Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Max Occupancy</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Active</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>


                <tbody className="divide-y divide-gray-200">
                  {rooms.map((room, index) => (
                    <tr key={room.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {room.roomNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{room.hotelName || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{room.roomTypeName || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{room.floor || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-green-600">
                          Nu {room.basePrice || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{room.maxOccupancy || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          room.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                          room.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' :
                          room.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                          room.status === 'OUT_OF_ORDER' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {room.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          room.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-48">
                          <span className="text-xs text-gray-600 truncate block">
                            {room.description || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditRoom(room)}
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                            title="Edit room"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                            title="Delete room"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Room Description Panel */}
            <div className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Room Details</h4>
                <div className="text-xs text-gray-600">
                  Click on any row to view detailed room descriptions and additional information.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Rooms State */}
      {!isLoading && !error && selectedHotelId && rooms.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No rooms found</p>
              <p className="text-sm mt-1">No rooms are currently registered in the system.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Room</h3>
              <button 
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={editFormData.roomNumber}
                  onChange={(e) => handleEditFormChange('roomNumber', e.target.value)}
                  placeholder="e.g., 101"
                />
              </div>
              
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  value={editFormData.floor}
                  onChange={(e) => handleEditFormChange('floor', parseInt(e.target.value))}
                  placeholder="e.g., 1"
                />
              </div>
              
              <div>
                <Label htmlFor="basePrice">Base Price ($)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={editFormData.basePrice}
                  onChange={(e) => handleEditFormChange('basePrice', parseFloat(e.target.value))}
                  placeholder="e.g., 99.99"
                />
              </div>
              
              <div>
                <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                <Input
                  id="maxOccupancy"
                  type="number"
                  value={editFormData.maxOccupancy}
                  onChange={(e) => handleEditFormChange('maxOccupancy', parseInt(e.target.value))}
                  placeholder="e.g., 2"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => handleEditFormChange('status', e.target.value)}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_ORDER">Out of Order</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="isActive">Active Status</Label>
                <Select
                  id="isActive"
                  value={editFormData.isActive.toString()}
                  onChange={(e) => handleEditFormChange('isActive', e.target.value === 'true')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Room description..."
                  rows={3}
                />
              </div>
              
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSaveEdit}
                  disabled={isEditLoading}
                  className="flex items-center gap-2"
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
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Room</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this room? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={confirmDelete}
                disabled={isDeleteLoading}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                {isDeleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Room
              </Button>
              <Button 
                onClick={cancelDelete}
                variant="outline"
                disabled={isDeleteLoading}
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
