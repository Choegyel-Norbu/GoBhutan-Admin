import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Bed, Wifi, Car, Coffee, Shield, Utensils, Tv, Wind, Waves } from 'lucide-react';

const AddRoomsPage = () => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    // Hotel Selection
    hotelId: '',
    
    // Room Information
    roomType: '',
    roomNumber: '',
    floor: '',
    maxOccupancy: '',
    bedType: '',
    roomSize: '',
    
    // Pricing
    basePrice: '',
    currency: 'USD',
    
    // Amenities
    amenities: {
      wifi: false,
      tv: false,
      minibar: false,
      safe: false,
      balcony: false,
      oceanView: false,
      cityView: false,
      airConditioning: false,
      heating: false,
      roomService: false,
      housekeeping: false,
      laundry: false,
      iron: false,
      coffeeMaker: false,
      refrigerator: false,
      microwave: false,
      desk: false,
      chair: false,
      sofa: false,
      wardrobe: false,
      bathroom: false,
      bathtub: false,
      shower: false,
      toiletries: false,
      towels: false,
      hairdryer: false,
      telephone: false,
      alarmClock: false,
      blackoutCurtains: false,
      soundproofing: false,
      smokingAllowed: false,
      petFriendly: false,
      wheelchairAccessible: false,
      connectingRooms: false,
      interconnectingRooms: false,
      suite: false,
      executive: false,
      presidential: false,
      honeymoon: false,
      family: false,
      business: false,
      leisure: false,
      romantic: false,
      luxury: false,
      budget: false,
      standard: false,
      deluxe: false,
      premium: false,
      vip: false,
      penthouse: false,
      studio: false,
      oneBedroom: false,
      twoBedroom: false,
      threeBedroom: false,
      fourBedroom: false,
      fiveBedroom: false,
      sixBedroom: false,
      sevenBedroom: false,
      eightBedroom: false,
      nineBedroom: false,
      tenBedroom: false
    },
    
    // Description
    description: '',
    specialFeatures: '',
    
    // Images
    images: [],
    
    // Availability
    isAvailable: true,
    maintenanceRequired: false,
    outOfOrder: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAmenityChange = (amenity, checked) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: checked
      }
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hotelId) newErrors.hotelId = 'Please select a hotel';
    if (!formData.roomType) newErrors.roomType = 'Room type is required';
    if (!formData.roomNumber) newErrors.roomNumber = 'Room number is required';
    if (!formData.maxOccupancy) newErrors.maxOccupancy = 'Maximum occupancy is required';
    if (!formData.bedType) newErrors.bedType = 'Bed type is required';
    if (!formData.basePrice) newErrors.basePrice = 'Base price is required';
    
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage({
        type: 'success',
        message: 'Room added successfully!'
      });
      
      // Reset form
      setFormData({
        hotelId: '',
        roomType: '',
        roomNumber: '',
        floor: '',
        maxOccupancy: '',
        bedType: '',
        roomSize: '',
        basePrice: '',
        currency: 'USD',
        amenities: Object.keys(formData.amenities).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
        description: '',
        specialFeatures: '',
        images: [],
        isAvailable: true,
        maintenanceRequired: false,
        outOfOrder: false
      });
      
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'Failed to add room. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomTypes = [
    'Standard Room',
    'Deluxe Room',
    'Executive Room',
    'Suite',
    'Presidential Suite',
    'Penthouse',
    'Studio',
    'One Bedroom',
    'Two Bedroom',
    'Family Room',
    'Honeymoon Suite',
    'Business Room',
    'Accessible Room'
  ];

  const bedTypes = [
    'Single Bed',
    'Double Bed',
    'Queen Bed',
    'King Bed',
    'Twin Beds',
    'Bunk Beds',
    'Sofa Bed',
    'Murphy Bed',
    'Water Bed',
    'Air Bed'
  ];

  const currencies = [
    'BTN','USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'
  ];

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bed className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Add Rooms</h1>
          <p className="text-muted-foreground">Add new rooms to existing hotels</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hotel Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Hotel Selection
            </CardTitle>
            <CardDescription>
              Select the hotel where you want to add rooms
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
                  <option value="hotel1">Grand Hotel Plaza</option>
                  <option value="hotel2">Luxury Resort & Spa</option>
                  <option value="hotel3">Business Hotel Center</option>
                  <option value="hotel4">Boutique Hotel Downtown</option>
                </Select>
                {errors.hotelId && (
                  <p className="text-sm text-destructive">{errors.hotelId}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Information */}
        <Card>
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
            <CardDescription>
              Basic details about the room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Label htmlFor="roomNumber">Room Number *</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                  placeholder="e.g., 101, A-205"
                />
                {errors.roomNumber && (
                  <p className="text-sm text-destructive">{errors.roomNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  placeholder="Floor number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
                <Input
                  id="maxOccupancy"
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) => handleInputChange('maxOccupancy', e.target.value)}
                  placeholder="Maximum guests"
                />
                {errors.maxOccupancy && (
                  <p className="text-sm text-destructive">{errors.maxOccupancy}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedType">Bed Type *</Label>
                <Select
                  value={formData.bedType}
                  onValueChange={(value) => handleInputChange('bedType', value)}
                >
                  <option value="">Select bed type</option>
                  {bedTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                {errors.bedType && (
                  <p className="text-sm text-destructive">{errors.bedType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomSize">Room Size (sq ft)</Label>
                <Input
                  id="roomSize"
                  type="number"
                  value={formData.roomSize}
                  onChange={(e) => handleInputChange('roomSize', e.target.value)}
                  placeholder="Room area"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>
              Set the base price for the room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (per night) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
                {errors.basePrice && (
                  <p className="text-sm text-destructive">{errors.basePrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Room Amenities</CardTitle>
            <CardDescription>
              Select the amenities available in this room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(formData.amenities).map(([amenity, checked]) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={amenity}
                    checked={checked}
                    onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={amenity} className="text-sm capitalize">
                    {amenity.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Provide details about the room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Room Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the room features, layout, and atmosphere..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialFeatures">Special Features</Label>
              <Textarea
                id="specialFeatures"
                value={formData.specialFeatures}
                onChange={(e) => handleInputChange('specialFeatures', e.target.value)}
                placeholder="Any special features or unique selling points..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Room Images</CardTitle>
            <CardDescription>
              Upload photos of the room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images">Upload Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Room image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Status */}
        <Card>
          <CardHeader>
            <CardTitle>Availability Status</CardTitle>
            <CardDescription>
              Set the current status of the room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isAvailable">Room is available for booking</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="maintenanceRequired"
                  checked={formData.maintenanceRequired}
                  onChange={(e) => handleInputChange('maintenanceRequired', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="maintenanceRequired">Maintenance required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="outOfOrder"
                  checked={formData.outOfOrder}
                  onChange={(e) => handleInputChange('outOfOrder', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="outOfOrder">Out of order</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Room...' : 'Add Room'}
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

export default AddRoomsPage;
