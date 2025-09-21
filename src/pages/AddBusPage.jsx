import { useState } from 'react';
import { Bus, Plus, Save, X } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

function AddBusPage() {
  const [formData, setFormData] = useState({
    busNumber: '',
    busName: '',
    capacity: '',
    type: '',
    route: '',
    driverName: '',
    driverContact: '',
    description: '',
    status: 'active'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFormData({
        busNumber: '',
        busName: '',
        capacity: '',
        type: '',
        route: '',
        driverName: '',
        driverContact: '',
        description: '',
        status: 'active'
      });
      
      alert('Bus added successfully!');
    } catch (error) {
      alert('Error adding bus. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      busNumber: '',
      busName: '',
      capacity: '',
      type: '',
      route: '',
      driverName: '',
      driverContact: '',
      description: '',
      status: 'active'
    });
  };

  return (
    <PageWrapper 
      title="Add New Bus" 
      description="Add a new bus to the fleet management system."
    >
      <div className="w-full mx-auto space-y-6">
        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Bus Information
            </CardTitle>
            <CardDescription>
              Enter the details for the new bus to be added to the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="busNumber">Bus Number *</Label>
                  <Input
                    id="busNumber"
                    value={formData.busNumber}
                    onChange={(e) => handleInputChange('busNumber', e.target.value)}
                    placeholder="e.g., BT-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="busName">Bus Name *</Label>
                  <Input
                    id="busName"
                    value={formData.busName}
                    onChange={(e) => handleInputChange('busName', e.target.value)}
                    placeholder="e.g., Mountain Express"
                    required
                  />
                </div>
              </div>

              {/* Capacity and Type */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Seating Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="e.g., 50"
                    min="1"
                    max="100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Bus Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                    required
                  >
                    <option value="">Select bus type</option>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="luxury">Luxury</option>
                    <option value="sleeper">Sleeper</option>
                    <option value="ac">AC Bus</option>
                  </Select>
                </div>
              </div>

              {/* Route Information */}
              <div className="space-y-2">
                <Label htmlFor="route">Primary Route *</Label>
                <Input
                  id="route"
                  value={formData.route}
                  onChange={(e) => handleInputChange('route', e.target.value)}
                  placeholder="e.g., Thimphu - Paro"
                  required
                />
              </div>

              {/* Driver Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name *</Label>
                  <Input
                    id="driverName"
                    value={formData.driverName}
                    onChange={(e) => handleInputChange('driverName', e.target.value)}
                    placeholder="e.g., Dorji Wangchuk"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverContact">Driver Contact *</Label>
                  <Input
                    id="driverContact"
                    value={formData.driverContact}
                    onChange={(e) => handleInputChange('driverContact', e.target.value)}
                    placeholder="e.g., +975-17-123456"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional notes about the bus..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Adding Bus...' : 'Add Bus'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Reset Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                <p>Ensure the bus number is unique and follows your organization's naming convention.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                <p>Seating capacity should match the actual number of seats in the bus.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                <p>Driver contact information is essential for emergency situations.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                <p>Set the appropriate status based on the bus's current operational state.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

export default AddBusPage;
