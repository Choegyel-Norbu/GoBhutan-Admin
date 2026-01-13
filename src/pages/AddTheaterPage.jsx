import { useState } from 'react';
import { Building, MapPin, Save, X } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import Swal from 'sweetalert2';

function AddTheaterPage() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    dzongkhag: '',
    thromde: '',
    miniTown: '',
    description: '',
    type: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Theater name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Theater name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Theater name must be less than 100 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    } else if (formData.location.trim().length > 200) {
      newErrors.location = 'Location must be less than 200 characters';
    }

    if (formData.dzongkhag.trim() && formData.dzongkhag.trim().length > 100) {
      newErrors.dzongkhag = 'Dzongkhag must be less than 100 characters';
    }

    if (formData.thromde.trim() && formData.thromde.trim().length > 100) {
      newErrors.thromde = 'Thromde must be less than 100 characters';
    }

    if (formData.miniTown.trim() && formData.miniTown.trim().length > 100) {
      newErrors.miniTown = 'Mini town must be less than 100 characters';
    }

    if (formData.description.trim() && formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    } else if (!['standard', 'normal'].includes(formData.type)) {
      newErrors.type = 'Type must be either standard or normal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // const response = await api.theater.createTheater(formData);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Theater registered successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });

      // Reset form
      setFormData({
        name: '',
        location: '',
        dzongkhag: '',
        thromde: '',
        miniTown: '',
        description: '',
        type: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error registering theater:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Failed to register theater. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      location: '',
      dzongkhag: '',
      thromde: '',
      miniTown: '',
      description: '',
      type: ''
    });
    setErrors({});
  };

  return (
    <PageWrapper 
      title="Register Theater" 
      description="Register a new theater in the system."
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Theater Registration
          </CardTitle>
          <CardDescription>
            Fill in the details to register a new theater.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter theater name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter theater location"
                    className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Dzongkhag and Thromde */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dzongkhag">Dzongkhag</Label>
                <Input
                  id="dzongkhag"
                  value={formData.dzongkhag}
                  onChange={(e) => handleInputChange('dzongkhag', e.target.value)}
                  placeholder="Enter dzongkhag"
                  className={errors.dzongkhag ? 'border-red-500' : ''}
                />
                {errors.dzongkhag && (
                  <p className="text-sm text-red-500">{errors.dzongkhag}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thromde">Thromde</Label>
                <Input
                  id="thromde"
                  value={formData.thromde}
                  onChange={(e) => handleInputChange('thromde', e.target.value)}
                  placeholder="Enter thromde"
                  className={errors.thromde ? 'border-red-500' : ''}
                />
                {errors.thromde && (
                  <p className="text-sm text-red-500">{errors.thromde}</p>
                )}
              </div>
            </div>

            {/* Mini Town and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="miniTown">Mini Town</Label>
                <Input
                  id="miniTown"
                  value={formData.miniTown}
                  onChange={(e) => handleInputChange('miniTown', e.target.value)}
                  placeholder="Enter mini town"
                  className={errors.miniTown ? 'border-red-500' : ''}
                />
                {errors.miniTown && (
                  <p className="text-sm text-red-500">{errors.miniTown}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={errors.type ? 'border-red-500' : ''}
                >
                  <option value="">Select theater type</option>
                  <option value="standard">Standard</option>
                  <option value="normal">Normal</option>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter theater description"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Registering...' : 'Register Theater'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default AddTheaterPage;

