import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Edit, Search, Calendar, Users, MapPin, Phone, Mail } from 'lucide-react';

const EditBookingsPage = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    bookingId: '',
    guestName: '',
    hotel: '',
    status: ''
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });

  const [bookings] = useState([
    {
      id: 'BK001',
      guestName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      hotel: 'Grand Hotel Plaza',
      roomType: 'Deluxe Room',
      roomNumber: '205',
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      adults: 2,
      children: 1,
      totalAmount: 897,
      currency: 'USD',
      status: 'confirmed',
      bookingDate: '2024-01-10',
      specialRequests: 'Late check-in requested',
      paymentStatus: 'paid'
    },
    {
      id: 'BK002',
      guestName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543',
      hotel: 'Luxury Resort & Spa',
      roomType: 'Ocean View Suite',
      roomNumber: '301',
      checkIn: '2024-01-20',
      checkOut: '2024-01-25',
      adults: 2,
      children: 0,
      totalAmount: 2495,
      currency: 'USD',
      status: 'pending',
      bookingDate: '2024-01-12',
      specialRequests: 'Anniversary celebration',
      paymentStatus: 'pending'
    }
  ]);

  const [editForm, setEditForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    hotel: '',
    roomType: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    status: ''
  });

  const handleSearchChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const searchBookings = () => {
    const filtered = bookings.filter(booking => {
      return (
        (!searchCriteria.bookingId || booking.id.includes(searchCriteria.bookingId)) &&
        (!searchCriteria.guestName || booking.guestName.toLowerCase().includes(searchCriteria.guestName.toLowerCase())) &&
        (!searchCriteria.hotel || booking.hotel === searchCriteria.hotel) &&
        (!searchCriteria.status || booking.status === searchCriteria.status)
      );
    });
    
    if (filtered.length > 0) {
      setSelectedBooking(filtered[0]);
      setEditForm({
        guestName: filtered[0].guestName,
        email: filtered[0].email,
        phone: filtered[0].phone,
        hotel: filtered[0].hotel,
        roomType: filtered[0].roomType,
        roomNumber: filtered[0].roomNumber,
        checkIn: filtered[0].checkIn,
        checkOut: filtered[0].checkOut,
        adults: filtered[0].adults,
        children: filtered[0].children,
        specialRequests: filtered[0].specialRequests,
        status: filtered[0].status
      });
    } else {
      setSelectedBooking(null);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitMessage({
        type: 'success',
        message: 'Booking updated successfully!'
      });
      
      setIsEditing(false);
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'Failed to update booking. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hotels = [
    'Grand Hotel Plaza',
    'Luxury Resort & Spa',
    'Business Hotel Center',
    'Boutique Hotel Downtown'
  ];

  const roomTypes = [
    'Standard Room',
    'Deluxe Room',
    'Executive Room',
    'Suite',
    'Presidential Suite'
  ];

  const statuses = [
    'confirmed',
    'pending',
    'cancelled'
  ];

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Edit className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Edit Bookings</h1>
          <p className="text-muted-foreground">Modify existing bookings</p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Booking to Edit
          </CardTitle>
          <CardDescription>
            Search for a booking to modify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingId">Booking ID</Label>
              <Input
                id="bookingId"
                value={searchCriteria.bookingId}
                onChange={(e) => handleSearchChange('bookingId', e.target.value)}
                placeholder="BK001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                value={searchCriteria.guestName}
                onChange={(e) => handleSearchChange('guestName', e.target.value)}
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel">Hotel</Label>
              <Select
                value={searchCriteria.hotel}
                onValueChange={(value) => handleSearchChange('hotel', value)}
              >
                <option value="">All hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel} value={hotel}>{hotel}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={searchCriteria.status}
                onValueChange={(value) => handleSearchChange('status', value)}
              >
                <option value="">All statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={searchBookings}>
              Search Bookings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Booking Details */}
      {selectedBooking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Booking Details - #{selectedBooking.id}</span>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Booking
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Current booking information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Guest Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Guest Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="editGuestName">Guest Name</Label>
                        <Input
                          id="editGuestName"
                          value={editForm.guestName}
                          onChange={(e) => handleEditFormChange('guestName', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editEmail">Email</Label>
                        <Input
                          id="editEmail"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editPhone">Phone</Label>
                        <Input
                          id="editPhone"
                          value={editForm.phone}
                          onChange={(e) => handleEditFormChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Booking Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="editHotel">Hotel</Label>
                        <Select
                          value={editForm.hotel}
                          onValueChange={(value) => handleEditFormChange('hotel', value)}
                        >
                          {hotels.map(hotel => (
                            <option key={hotel} value={hotel}>{hotel}</option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editRoomType">Room Type</Label>
                        <Select
                          value={editForm.roomType}
                          onValueChange={(value) => handleEditFormChange('roomType', value)}
                        >
                          {roomTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editRoomNumber">Room Number</Label>
                        <Input
                          id="editRoomNumber"
                          value={editForm.roomNumber}
                          onChange={(e) => handleEditFormChange('roomNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dates */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Stay Dates</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="editCheckIn">Check-in Date</Label>
                        <Input
                          id="editCheckIn"
                          type="date"
                          value={editForm.checkIn}
                          onChange={(e) => handleEditFormChange('checkIn', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editCheckOut">Check-out Date</Label>
                        <Input
                          id="editCheckOut"
                          type="date"
                          value={editForm.checkOut}
                          onChange={(e) => handleEditFormChange('checkOut', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Guest Count</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="editAdults">Adults</Label>
                        <Input
                          id="editAdults"
                          type="number"
                          min="1"
                          value={editForm.adults}
                          onChange={(e) => handleEditFormChange('adults', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editChildren">Children</Label>
                        <Input
                          id="editChildren"
                          type="number"
                          min="0"
                          value={editForm.children}
                          onChange={(e) => handleEditFormChange('children', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Additional Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSpecialRequests">Special Requests</Label>
                      <Textarea
                        id="editSpecialRequests"
                        value={editForm.specialRequests}
                        onChange={(e) => handleEditFormChange('specialRequests', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editStatus">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => handleEditFormChange('status', value)}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Guest Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guest Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedBooking.guestName}</p>
                      <p><strong>Email:</strong> {selectedBooking.email}</p>
                      <p><strong>Phone:</strong> {selectedBooking.phone}</p>
                    </div>
                  </div>

                  {/* Hotel Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Hotel Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Hotel:</strong> {selectedBooking.hotel}</p>
                      <p><strong>Room:</strong> {selectedBooking.roomType} (#{selectedBooking.roomNumber})</p>
                      <p><strong>Guests:</strong> {selectedBooking.adults} adults, {selectedBooking.children} children</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Stay Details
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Check-in:</strong> {new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                      <p><strong>Check-out:</strong> {new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                      <p><strong>Total:</strong> ${selectedBooking.totalAmount} {selectedBooking.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Special Requests</h4>
                    <p className="text-sm">{selectedBooking.specialRequests}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Message */}
      {submitMessage.message && (
        <div className={`p-4 rounded-lg ${
          submitMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitMessage.message}
        </div>
      )}
    </div>
  );
};

export default EditBookingsPage;
