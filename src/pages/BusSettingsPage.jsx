import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

function BusSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'GoBhutan Transport',
    timezone: 'Asia/Thimphu',
    currency: 'BTN',
    language: 'en',
    
    // Booking Settings
    advanceBookingDays: '30',
    cancellationPolicy: '24',
    maxSeatsPerBooking: '10',
    autoConfirmBookings: true,
    
    // Pricing Settings
    baseFare: '50',
    distanceRate: '5',
    peakHourMultiplier: '1.5',
    weekendMultiplier: '1.2',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    bookingConfirmation: true,
    reminderNotifications: true,
    reminderHours: '2',
    
    // System Settings
    maintenanceMode: false,
    allowOnlineBooking: true,
    requireDriverApproval: false,
    autoAssignDrivers: true,
    
    // Route Settings
    defaultRouteDuration: '60',
    bufferTime: '15',
    maxRouteDistance: '200',
    
    // Terms and Conditions
    termsAndConditions: 'By booking a bus ticket, passengers agree to follow all safety regulations and arrive at the designated pickup point 15 minutes before departure time.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        companyName: 'GoBhutan Transport',
        timezone: 'Asia/Thimphu',
        currency: 'BTN',
        language: 'en',
        advanceBookingDays: '30',
        cancellationPolicy: '24',
        maxSeatsPerBooking: '10',
        autoConfirmBookings: true,
        baseFare: '50',
        distanceRate: '5',
        peakHourMultiplier: '1.5',
        weekendMultiplier: '1.2',
        emailNotifications: true,
        smsNotifications: true,
        bookingConfirmation: true,
        reminderNotifications: true,
        reminderHours: '2',
        maintenanceMode: false,
        allowOnlineBooking: true,
        requireDriverApproval: false,
        autoAssignDrivers: true,
        defaultRouteDuration: '60',
        bufferTime: '15',
        maxRouteDistance: '200',
        termsAndConditions: 'By booking a bus ticket, passengers agree to follow all safety regulations and arrive at the designated pickup point 15 minutes before departure time.'
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'booking', label: 'Booking' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'routes', label: 'Routes' },
    { id: 'terms', label: 'Terms' }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={settings.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => handleInputChange('timezone', value)}
          >
            <option value="Asia/Thimphu">Asia/Thimphu (Bhutan)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
            <option value="UTC">UTC</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={settings.currency}
            onValueChange={(value) => handleInputChange('currency', value)}
          >
            <option value="BTN">BTN (Bhutanese Ngultrum)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="INR">INR (Indian Rupee)</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => handleInputChange('language', value)}
          >
            <option value="en">English</option>
            <option value="dz">Dzongkha</option>
            <option value="hi">Hindi</option>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderBookingSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="advanceBookingDays">Advance Booking (Days)</Label>
          <Input
            id="advanceBookingDays"
            type="number"
            value={settings.advanceBookingDays}
            onChange={(e) => handleInputChange('advanceBookingDays', e.target.value)}
            min="1"
            max="365"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cancellationPolicy">Cancellation Policy (Hours)</Label>
          <Input
            id="cancellationPolicy"
            type="number"
            value={settings.cancellationPolicy}
            onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
            min="1"
            max="72"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxSeatsPerBooking">Max Seats Per Booking</Label>
        <Input
          id="maxSeatsPerBooking"
          type="number"
          value={settings.maxSeatsPerBooking}
          onChange={(e) => handleInputChange('maxSeatsPerBooking', e.target.value)}
          min="1"
          max="50"
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoConfirmBookings"
            checked={settings.autoConfirmBookings}
            onChange={(e) => handleInputChange('autoConfirmBookings', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="autoConfirmBookings">Auto-confirm bookings</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="allowOnlineBooking"
            checked={settings.allowOnlineBooking}
            onChange={(e) => handleInputChange('allowOnlineBooking', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="allowOnlineBooking">Allow online booking</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="requireDriverApproval"
            checked={settings.requireDriverApproval}
            onChange={(e) => handleInputChange('requireDriverApproval', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="requireDriverApproval">Require driver approval</Label>
        </div>
      </div>
    </div>
  );

  const renderPricingSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="baseFare">Base Fare (BTN)</Label>
          <Input
            id="baseFare"
            type="number"
            value={settings.baseFare}
            onChange={(e) => handleInputChange('baseFare', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="distanceRate">Distance Rate (BTN/km)</Label>
          <Input
            id="distanceRate"
            type="number"
            value={settings.distanceRate}
            onChange={(e) => handleInputChange('distanceRate', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="peakHourMultiplier">Peak Hour Multiplier</Label>
          <Input
            id="peakHourMultiplier"
            type="number"
            value={settings.peakHourMultiplier}
            onChange={(e) => handleInputChange('peakHourMultiplier', e.target.value)}
            min="1"
            step="0.1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weekendMultiplier">Weekend Multiplier</Label>
          <Input
            id="weekendMultiplier"
            type="number"
            value={settings.weekendMultiplier}
            onChange={(e) => handleInputChange('weekendMultiplier', e.target.value)}
            min="1"
            step="0.1"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.emailNotifications}
            onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="emailNotifications">Enable email notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="smsNotifications"
            checked={settings.smsNotifications}
            onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="smsNotifications">Enable SMS notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="bookingConfirmation"
            checked={settings.bookingConfirmation}
            onChange={(e) => handleInputChange('bookingConfirmation', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="bookingConfirmation">Send booking confirmations</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="reminderNotifications"
            checked={settings.reminderNotifications}
            onChange={(e) => handleInputChange('reminderNotifications', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="reminderNotifications">Send reminder notifications</Label>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reminderHours">Reminder Hours Before Departure</Label>
        <Input
          id="reminderHours"
          type="number"
          value={settings.reminderHours}
          onChange={(e) => handleInputChange('reminderHours', e.target.value)}
          min="1"
          max="24"
        />
      </div>
    </div>
  );

  const renderRouteSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="defaultRouteDuration">Default Route Duration (Minutes)</Label>
          <Input
            id="defaultRouteDuration"
            type="number"
            value={settings.defaultRouteDuration}
            onChange={(e) => handleInputChange('defaultRouteDuration', e.target.value)}
            min="15"
            max="480"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bufferTime">Buffer Time (Minutes)</Label>
          <Input
            id="bufferTime"
            type="number"
            value={settings.bufferTime}
            onChange={(e) => handleInputChange('bufferTime', e.target.value)}
            min="5"
            max="60"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxRouteDistance">Maximum Route Distance (km)</Label>
        <Input
          id="maxRouteDistance"
          type="number"
          value={settings.maxRouteDistance}
          onChange={(e) => handleInputChange('maxRouteDistance', e.target.value)}
          min="10"
          max="1000"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoAssignDrivers"
          checked={settings.autoAssignDrivers}
          onChange={(e) => handleInputChange('autoAssignDrivers', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="autoAssignDrivers">Auto-assign drivers to routes</Label>
      </div>
    </div>
  );

  const renderTermsSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
        <Textarea
          id="termsAndConditions"
          value={settings.termsAndConditions}
          onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
          rows={8}
          placeholder="Enter terms and conditions for bus bookings..."
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.maintenanceMode}
          onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="maintenanceMode">Enable maintenance mode</Label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'booking':
        return renderBookingSettings();
      case 'pricing':
        return renderPricingSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'routes':
        return renderRouteSettings();
      case 'terms':
        return renderTermsSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <PageWrapper 
      title="Bus Settings" 
      description="Configure bus system preferences and operational settings."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tab Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>
              System Configuration
            </CardTitle>
            <CardDescription>
              Manage various aspects of your bus booking system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => {
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {renderTabContent()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Default
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

export default BusSettingsPage;
