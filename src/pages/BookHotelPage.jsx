import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Plus, Calendar, Users, CreditCard, MapPin, Clock } from 'lucide-react';

const BookHotelPage = () => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    // Guest Information
    guestName: '',
    email: '',
    phone: '',
    nationality: '',
    
    // Booking Details
    hotelId: '',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    rooms: 1,
    
    // Special Requests
    specialRequests: '',
    dietaryRequirements: '',
    
    // Payment
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    
    // Preferences
    smokingPreference: 'non-smoking',
    bedPreference: 'any',
    floorPreference: 'any',
    viewPreference: 'any'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.guestName) newErrors.guestName = 'Guest name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.hotelId) newErrors.hotelId = 'Please select a hotel';
    if (!formData.roomType) newErrors.roomType = 'Please select room type';
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage({
        type: 'success',
        message: 'Hotel booking created successfully!'
      });
      
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'Failed to create booking. Please try again.'
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

  const paymentMethods = [
    'Credit Card',
    'Debit Card',
    'PayPal',
    'Bank Transfer',
    'Cash on Arrival'
  ];

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Plus className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Book Hotel</h1>
          <p className="text-muted-foreground">Create new hotel bookings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Information
            </CardTitle>
            <CardDescription>
              Primary guest details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Guest Name *</Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  placeholder="Full name"
                />
                {errors.guestName && (
                  <p className="text-sm text-destructive">{errors.guestName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="Country of citizenship"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Details
            </CardTitle>
            <CardDescription>
              Hotel and stay information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelId">Hotel *</Label>
                <Select
                  value={formData.hotelId}
                  onValueChange={(value) => handleInputChange('hotelId', value)}
                >
                  <option value="">Select a hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel} value={hotel}>{hotel}</option>
                  ))}
                </Select>
                {errors.hotelId && (
                  <p className="text-sm text-destructive">{errors.hotelId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type *</Label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) => handleInputChange('roomType', value)}
                >
                  <option value="">Select room type</option>
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                {errors.roomType && (
                  <p className="text-sm text-destructive">{errors.roomType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkInDate">Check-in Date *</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                />
                {errors.checkInDate && (
                  <p className="text-sm text-destructive">{errors.checkInDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Check-out Date *</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                />
                {errors.checkOutDate && (
                  <p className="text-sm text-destructive">{errors.checkOutDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => handleInputChange('adults', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => handleInputChange('children', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Number of Rooms</Label>
                <Input
                  id="rooms"
                  type="number"
                  min="1"
                  value={formData.rooms}
                  onChange={(e) => handleInputChange('rooms', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Special Requests</CardTitle>
            <CardDescription>
              Any special requirements or preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special requests or requirements..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietaryRequirements">Dietary Requirements</Label>
              <Textarea
                id="dietaryRequirements"
                value={formData.dietaryRequirements}
                onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                placeholder="Any dietary restrictions or preferences..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Payment method and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </Select>
                {errors.paymentMethod && (
                  <p className="text-sm text-destructive">{errors.paymentMethod}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea
                id="billingAddress"
                value={formData.billingAddress}
                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                placeholder="Full billing address..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        </div>

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
      </form>
    </div>
  );
};

export default BookHotelPage;
