import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Trash2, Search, AlertTriangle, Calendar, Users, MapPin, DollarSign } from 'lucide-react';

const CancelBookingsPage = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    bookingId: '',
    guestName: '',
    hotel: '',
    status: ''
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [cancellationReason, setCancellationReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

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
      paymentStatus: 'paid',
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in'
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
      paymentStatus: 'pending',
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in'
    }
  ]);

  const handleSearchChange = (field, value) => {
    setSearchCriteria(prev => ({
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
      // Calculate refund amount based on cancellation policy
      const daysUntilCheckIn = Math.ceil((new Date(filtered[0].checkIn) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilCheckIn >= 2) {
        setRefundAmount(filtered[0].totalAmount);
      } else if (daysUntilCheckIn >= 1) {
        setRefundAmount(filtered[0].totalAmount * 0.5);
      } else {
        setRefundAmount(0);
      }
    } else {
      setSelectedBooking(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      setSubmitMessage({
        type: 'error',
        message: 'Please provide a reason for cancellation'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage({
        type: 'success',
        message: `Booking cancelled successfully. Refund amount: $${refundAmount} ${selectedBooking.currency}`
      });
      
      setSelectedBooking(null);
      setCancellationReason('');
      setRefundAmount(0);
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'Failed to cancel booking. Please try again.'
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

  const statuses = [
    'confirmed',
    'pending'
  ];

  const cancellationReasons = [
    'Change of plans',
    'Found better deal',
    'Travel restrictions',
    'Personal emergency',
    'Weather concerns',
    'Hotel issues',
    'Other'
  ];

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trash2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Cancel Bookings</h1>
          <p className="text-muted-foreground">Cancel hotel reservations</p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Booking to Cancel
          </CardTitle>
          <CardDescription>
            Search for a booking to cancel
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
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Cancel Booking - #{selectedBooking.id}
            </CardTitle>
            <CardDescription>
              Review booking details before cancellation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Information */}
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

              {/* Cancellation Policy */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Cancellation Policy</h4>
                <p className="text-sm text-blue-700">{selectedBooking.cancellationPolicy}</p>
              </div>

              {/* Refund Information */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Refund Information
                </h4>
                <p className="text-sm text-green-700">
                  Refund Amount: ${refundAmount} {selectedBooking.currency}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Refund will be processed within 5-7 business days
                </p>
              </div>

              {/* Cancellation Reason */}
              <div className="space-y-4">
                <h3 className="font-semibold">Cancellation Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancellationReason">Reason for Cancellation *</Label>
                    <Select
                      value={cancellationReason}
                      onValueChange={setCancellationReason}
                    >
                      <option value="">Select a reason</option>
                      {cancellationReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any additional information about the cancellation..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Keep Booking
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              </div>
            </div>
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

export default CancelBookingsPage;
