import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Eye, Calendar, Users, MapPin, Phone, Mail, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

const ViewBookingsPage = () => {
  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    hotel: '',
    dateRange: '',
    guestName: ''
  });

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
    },
    {
      id: 'BK003',
      guestName: 'Michael Brown',
      email: 'm.brown@email.com',
      phone: '+1 (555) 456-7890',
      hotel: 'Business Hotel Center',
      roomType: 'Executive Room',
      roomNumber: '1502',
      checkIn: '2024-01-22',
      checkOut: '2024-01-24',
      adults: 1,
      children: 0,
      totalAmount: 398,
      currency: 'USD',
      status: 'cancelled',
      bookingDate: '2024-01-08',
      specialRequests: 'Business trip',
      paymentStatus: 'refunded'
    },
    {
      id: 'BK004',
      guestName: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 321-0987',
      hotel: 'Boutique Hotel Downtown',
      roomType: 'Historic Suite',
      roomNumber: '401',
      checkIn: '2024-01-25',
      checkOut: '2024-01-28',
      adults: 2,
      children: 2,
      totalAmount: 1047,
      currency: 'USD',
      status: 'confirmed',
      bookingDate: '2024-01-14',
      specialRequests: 'Family vacation',
      paymentStatus: 'paid'
    }
  ]);

  const [filteredBookings, setFilteredBookings] = useState(bookings);

  const handleFilterChange = (field, value) => {
    const newCriteria = {
      ...filterCriteria,
      [field]: value
    };
    setFilterCriteria(newCriteria);
    
    // Apply filters
    let filtered = bookings;
    
    if (newCriteria.status) {
      filtered = filtered.filter(booking => booking.status === newCriteria.status);
    }
    
    if (newCriteria.hotel) {
      filtered = filtered.filter(booking => booking.hotel === newCriteria.hotel);
    }
    
    if (newCriteria.guestName) {
      filtered = filtered.filter(booking => 
        booking.guestName.toLowerCase().includes(newCriteria.guestName.toLowerCase())
      );
    }
    
    setFilteredBookings(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    'pending',
    'cancelled'
  ];

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Eye className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">View Bookings</h1>
          <p className="text-muted-foreground">View all hotel reservations</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
          <CardDescription>
            Filter bookings by status, hotel, or guest name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filterCriteria.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <option value="">All statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel">Hotel</Label>
              <Select
                value={filterCriteria.hotel}
                onValueChange={(value) => handleFilterChange('hotel', value)}
              >
                <option value="">All hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel} value={hotel}>{hotel}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                value={filterCriteria.guestName}
                onChange={(e) => handleFilterChange('guestName', e.target.value)}
                placeholder="Search by guest name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Input
                id="dateRange"
                type="date"
                value={filterCriteria.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Bookings ({filteredBookings.length})
          </h2>
        </div>

        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          Booking #{booking.id}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${booking.totalAmount}
                        <span className="text-sm font-normal text-muted-foreground">
                          {booking.currency}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Guest Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Guest Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {booking.guestName}</p>
                        <p><strong>Email:</strong> {booking.email}</p>
                        <p><strong>Phone:</strong> {booking.phone}</p>
                      </div>
                    </div>

                    {/* Hotel Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Hotel Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Hotel:</strong> {booking.hotel}</p>
                        <p><strong>Room:</strong> {booking.roomType} (#{booking.roomNumber})</p>
                        <p><strong>Guests:</strong> {booking.adults} adults, {booking.children} children</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Stay Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
                        <p><strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> {
                          Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))
                        } nights</p>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Special Requests</h4>
                      <p className="text-sm">{booking.specialRequests}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    {booking.status === 'confirmed' && (
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBookingsPage;
