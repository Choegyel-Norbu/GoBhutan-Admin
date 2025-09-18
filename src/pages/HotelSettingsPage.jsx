import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Settings, Building2, Wifi, Car, Coffee, Shield, Utensils, Save, RefreshCw } from 'lucide-react';

const HotelSettingsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [settings, setSettings] = useState({
    // General Settings
    hotelName: 'Grand Hotel Plaza',
    hotelChain: 'Luxury Hotels Group',
    category: 'Luxury',
    starRating: '5',
    timezone: 'UTC-5',
    currency: 'USD',
    language: 'en',
    
    // Contact Information
    address: '123 Main Street, Downtown',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postalCode: '10001',
    phone: '+1 (555) 123-4567',
    email: 'info@grandhotelplaza.com',
    website: 'https://www.grandhotelplaza.com',
    
    // Booking Settings
    checkInTime: '15:00',
    checkOutTime: '11:00',
    advanceBookingDays: '365',
    minimumStay: '1',
    maximumStay: '30',
    cancellationPolicy: '24',
    
    // Pricing Settings
    basePrice: '299',
    weekendSurcharge: '50',
    holidaySurcharge: '100',
    taxRate: '8.5',
    serviceCharge: '10',
    
    // Amenities
    amenities: {
      wifi: true,
      parking: true,
      pool: true,
      gym: true,
      spa: true,
      restaurant: true,
      bar: true,
      businessCenter: true,
      roomService: true,
      concierge: true,
      laundry: true,
      valet: true,
      airportShuttle: false,
      petFriendly: false,
      smokingAllowed: false
    },
    
    // Policies
    policies: {
      smokingPolicy: 'Non-smoking hotel',
      petPolicy: 'Pets not allowed',
      ageRestriction: '18+',
      groupBookingPolicy: 'Groups of 10+ require advance notice',
      paymentPolicy: 'Credit card required at booking',
      idPolicy: 'Valid ID required at check-in'
    },
    
    // Notifications
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      bookingConfirmations: true,
      cancellationNotifications: true,
      paymentReminders: true,
      checkInReminders: true,
      reviewRequests: true
    },
    
    // Integration Settings
    integrations: {
      bookingEngine: 'HotelBooking Pro',
      paymentGateway: 'Stripe',
      channelManager: 'SiteMinder',
      reviewSystem: 'Trustpilot',
      analytics: 'Google Analytics'
    }
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setSettings(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage({
        type: 'success',
        message: 'Hotel settings updated successfully!'
      });
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'Failed to update settings. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitMessage({ type: '', message: '' });
    // Reset to default values
    window.location.reload();
  };

  const categories = [
    'Budget',
    'Economy',
    'Mid-range',
    'Upscale',
    'Luxury',
    'Boutique',
    'Resort',
    'Business'
  ];

  const starRatings = ['1', '2', '3', '4', '5'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'];

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Hotel Settings</h1>
          <p className="text-muted-foreground">Configure hotel preferences</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic hotel information and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelName">Hotel Name</Label>
                <Input
                  id="hotelName"
                  value={settings.hotelName}
                  onChange={(e) => handleInputChange('hotelName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelChain">Hotel Chain</Label>
                <Input
                  id="hotelChain"
                  value={settings.hotelChain}
                  onChange={(e) => handleInputChange('hotelChain', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={settings.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="starRating">Star Rating</Label>
                <Select
                  value={settings.starRating}
                  onValueChange={(value) => handleInputChange('starRating', value)}
                >
                  {starRatings.map(rating => (
                    <option key={rating} value={rating}>{rating} Star{rating !== '1' ? 's' : ''}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Hotel contact details and address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={settings.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={settings.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={settings.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={settings.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Settings</CardTitle>
            <CardDescription>
              Configure booking policies and timing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={settings.checkInTime}
                  onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  value={settings.checkOutTime}
                  onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advanceBookingDays">Advance Booking (Days)</Label>
                <Input
                  id="advanceBookingDays"
                  type="number"
                  value={settings.advanceBookingDays}
                  onChange={(e) => handleInputChange('advanceBookingDays', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumStay">Minimum Stay (Nights)</Label>
                <Input
                  id="minimumStay"
                  type="number"
                  value={settings.minimumStay}
                  onChange={(e) => handleInputChange('minimumStay', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximumStay">Maximum Stay (Nights)</Label>
                <Input
                  id="maximumStay"
                  type="number"
                  value={settings.maximumStay}
                  onChange={(e) => handleInputChange('maximumStay', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellationPolicy">Cancellation Policy (Hours)</Label>
                <Input
                  id="cancellationPolicy"
                  type="number"
                  value={settings.cancellationPolicy}
                  onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Settings</CardTitle>
            <CardDescription>
              Configure pricing and charges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (per night)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={settings.basePrice}
                  onChange={(e) => handleInputChange('basePrice', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekendSurcharge">Weekend Surcharge (%)</Label>
                <Input
                  id="weekendSurcharge"
                  type="number"
                  value={settings.weekendSurcharge}
                  onChange={(e) => handleInputChange('weekendSurcharge', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holidaySurcharge">Holiday Surcharge (%)</Label>
                <Input
                  id="holidaySurcharge"
                  type="number"
                  value={settings.holidaySurcharge}
                  onChange={(e) => handleInputChange('holidaySurcharge', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => handleInputChange('taxRate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                <Input
                  id="serviceCharge"
                  type="number"
                  value={settings.serviceCharge}
                  onChange={(e) => handleInputChange('serviceCharge', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              Select available hotel amenities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(settings.amenities).map(([amenity, enabled]) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={amenity}
                    checked={enabled}
                    onChange={() => handleAmenityToggle(amenity)}
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

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Policies</CardTitle>
            <CardDescription>
              Define hotel policies and rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.policies).map(([policy, value]) => (
              <div key={policy} className="space-y-2">
                <Label htmlFor={policy}>
                  {policy.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <Textarea
                  id={policy}
                  value={value}
                  onChange={(e) => handleNestedInputChange('policies', policy, e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
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

export default HotelSettingsPage;
