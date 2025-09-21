import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, CreditCard, Search, Filter } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

function BusBookingPage() {
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
    busType: ''
  });

  const [selectedBus, setSelectedBus] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    seatNumbers: [],
    paymentMethod: 'cash'
  });

  const [isSearching, setIsSearching] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Mock data for available buses
  const availableBuses = [
    {
      id: 1,
      busNumber: 'BT-001',
      busName: 'Mountain Express',
      from: 'Thimphu',
      to: 'Paro',
      departure: '08:00',
      arrival: '09:30',
      duration: '1h 30m',
      price: 150,
      availableSeats: 15,
      totalSeats: 50,
      busType: 'Standard',
      amenities: ['AC', 'WiFi', 'Water']
    },
    {
      id: 2,
      busNumber: 'BT-002',
      busName: 'Royal Transport',
      from: 'Thimphu',
      to: 'Paro',
      departure: '10:00',
      arrival: '11:30',
      duration: '1h 30m',
      price: 200,
      availableSeats: 8,
      totalSeats: 40,
      busType: 'Deluxe',
      amenities: ['AC', 'WiFi', 'Water', 'Snacks']
    },
    {
      id: 3,
      busNumber: 'BT-003',
      busName: 'Himalayan Express',
      from: 'Thimphu',
      to: 'Paro',
      departure: '14:00',
      arrival: '15:30',
      duration: '1h 30m',
      price: 120,
      availableSeats: 25,
      totalSeats: 45,
      busType: 'Standard',
      amenities: ['AC', 'Water']
    }
  ];

  const handleSearchChange = (field, value) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBookingChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, this would filter buses based on search criteria
    } catch (error) {
      alert('Error searching buses. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookBus = (bus) => {
    setSelectedBus(bus);
    setBookingForm(prev => ({
      ...prev,
      seatNumbers: []
    }));
  };

  const handleSeatSelection = (seatNumber) => {
    const seats = bookingForm.seatNumbers;
    if (seats.includes(seatNumber)) {
      setBookingForm(prev => ({
        ...prev,
        seatNumbers: seats.filter(s => s !== seatNumber)
      }));
    } else {
      if (seats.length < parseInt(searchForm.passengers)) {
        setBookingForm(prev => ({
          ...prev,
          seatNumbers: [...seats, seatNumber]
        }));
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (bookingForm.seatNumbers.length !== parseInt(searchForm.passengers)) {
      alert('Please select the correct number of seats.');
      return;
    }

    setIsBooking(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Booking confirmed successfully!');
      setSelectedBus(null);
      setBookingForm({
        passengerName: '',
        passengerEmail: '',
        passengerPhone: '',
        seatNumbers: [],
        paymentMethod: 'cash'
      });
    } catch (error) {
      alert('Error confirming booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const generateSeats = (totalSeats) => {
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push(i);
    }
    return seats;
  };

  return (
    <PageWrapper 
      title="Bus Booking" 
      description="Search and book bus tickets for your journey."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Buses
            </CardTitle>
            <CardDescription>
              Find available buses for your journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Select
                    value={searchForm.from}
                    onValueChange={(value) => handleSearchChange('from', value)}
                    required
                  >
                    <option value="">Select departure</option>
                    <option value="Thimphu">Thimphu</option>
                    <option value="Paro">Paro</option>
                    <option value="Punakha">Punakha</option>
                    <option value="Wangdue">Wangdue</option>
                    <option value="Trongsa">Trongsa</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Select
                    value={searchForm.to}
                    onValueChange={(value) => handleSearchChange('to', value)}
                    required
                  >
                    <option value="">Select destination</option>
                    <option value="Thimphu">Thimphu</option>
                    <option value="Paro">Paro</option>
                    <option value="Punakha">Punakha</option>
                    <option value="Wangdue">Wangdue</option>
                    <option value="Trongsa">Trongsa</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Travel Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => handleSearchChange('date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passengers">Passengers</Label>
                  <Select
                    value={searchForm.passengers}
                    onValueChange={(value) => handleSearchChange('passengers', value)}
                    required
                  >
                    <option value="1">1 Passenger</option>
                    <option value="2">2 Passengers</option>
                    <option value="3">3 Passengers</option>
                    <option value="4">4 Passengers</option>
                    <option value="5">5 Passengers</option>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search Buses'}
                </Button>
                <Button type="button" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Available Buses */}
        {searchForm.from && searchForm.to && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Available Buses
              </CardTitle>
              <CardDescription>
                {availableBuses.length} buses found for {searchForm.from} to {searchForm.to}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableBuses.map((bus) => (
                  <Card key={bus.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{bus.busName}</h3>
                            <Badge variant="outline">{bus.busType}</Badge>
                            <Badge variant="secondary">{bus.busNumber}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {bus.departure} - {bus.arrival}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {bus.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {bus.availableSeats} seats available
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {bus.amenities.map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-primary">
                            BTN {bus.price}
                          </div>
                          <Button 
                            onClick={() => handleBookBus(bus)}
                            disabled={bus.availableSeats === 0}
                          >
                            {bus.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Modal */}
        {selectedBus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Book {selectedBus.busName}
              </CardTitle>
              <CardDescription>
                Complete your booking details and select seats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Passenger Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Passenger Details</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="passengerName">Full Name *</Label>
                      <Input
                        id="passengerName"
                        value={bookingForm.passengerName}
                        onChange={(e) => handleBookingChange('passengerName', e.target.value)}
                        placeholder="Enter passenger name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passengerEmail">Email *</Label>
                      <Input
                        id="passengerEmail"
                        type="email"
                        value={bookingForm.passengerEmail}
                        onChange={(e) => handleBookingChange('passengerEmail', e.target.value)}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passengerPhone">Phone *</Label>
                      <Input
                        id="passengerPhone"
                        value={bookingForm.passengerPhone}
                        onChange={(e) => handleBookingChange('passengerPhone', e.target.value)}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={bookingForm.paymentMethod}
                        onValueChange={(value) => handleBookingChange('paymentMethod', value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="bank">Bank Transfer</option>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Seat Selection */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Select Seats</h4>
                  <div className="text-sm text-muted-foreground mb-4">
                    Select {searchForm.passengers} seat(s). Selected: {bookingForm.seatNumbers.length}/{searchForm.passengers}
                  </div>
                  <div className="grid grid-cols-10 gap-2">
                    {generateSeats(selectedBus.totalSeats).map((seatNumber) => {
                      const isSelected = bookingForm.seatNumbers.includes(seatNumber);
                      const isAvailable = seatNumber <= selectedBus.availableSeats;
                      
                      return (
                        <button
                          key={seatNumber}
                          onClick={() => isAvailable && handleSeatSelection(seatNumber)}
                          disabled={!isAvailable}
                          className={`
                            w-8 h-8 text-xs rounded border transition-colors
                            ${isSelected 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : isAvailable 
                                ? 'bg-background hover:bg-accent border-border' 
                                : 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                            }
                          `}
                        >
                          {seatNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Bus:</span>
                    <span>{selectedBus.busName} ({selectedBus.busNumber})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span>{selectedBus.from} → {selectedBus.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Departure:</span>
                    <span>{selectedBus.departure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span>{searchForm.passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span>{bookingForm.seatNumbers.join(', ') || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>BTN {selectedBus.price * parseInt(searchForm.passengers)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={handleConfirmBooking}
                  disabled={isBooking || bookingForm.seatNumbers.length !== parseInt(searchForm.passengers)}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {isBooking ? 'Processing...' : 'Confirm Booking'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedBus(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

export default BusBookingPage;
