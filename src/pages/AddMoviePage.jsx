import { useState } from 'react';
import { Film, Calendar, Save, X } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import Swal from 'sweetalert2';

function AddMoviePage() {
  const [formData, setFormData] = useState({
    movieName: '',
    dateTime: '',
    description: ''
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

    if (!formData.movieName.trim()) {
      newErrors.movieName = 'Movie name is required';
    } else if (formData.movieName.trim().length < 2) {
      newErrors.movieName = 'Movie name must be at least 2 characters';
    } else if (formData.movieName.trim().length > 200) {
      newErrors.movieName = 'Movie name must be less than 200 characters';
    }

    if (!formData.dateTime.trim()) {
      newErrors.dateTime = 'Date and time is required';
    } else {
      // Validate date-time format
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!dateTimeRegex.test(formData.dateTime)) {
        newErrors.dateTime = 'Please enter a valid date and time (YYYY-MM-DDTHH:MM)';
      } else {
        const selectedDate = new Date(formData.dateTime);
        const now = new Date();
        if (isNaN(selectedDate.getTime())) {
          newErrors.dateTime = 'Please enter a valid date and time';
        } else if (selectedDate < now) {
          newErrors.dateTime = 'Date and time cannot be in the past';
        }
      }
    }

    if (formData.description.trim() && formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
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
      // const response = await api.theater.createMovie(formData);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Movie registered successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });

      // Reset form
      setFormData({
        movieName: '',
        dateTime: '',
        description: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error registering movie:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Failed to register movie. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      movieName: '',
      dateTime: '',
      description: ''
    });
    setErrors({});
  };

  // Get current date-time in local format for min attribute
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <PageWrapper 
      title="Register Movie" 
      description="Register a new movie for theater screenings."
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Movie Registration
          </CardTitle>
          <CardDescription>
            Fill in the details to register a new movie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Movie Name */}
            <div className="space-y-2">
              <Label htmlFor="movieName">Movie Name *</Label>
              <Input
                id="movieName"
                value={formData.movieName}
                onChange={(e) => handleInputChange('movieName', e.target.value)}
                placeholder="Enter movie name"
                className={errors.movieName ? 'border-red-500' : ''}
              />
              {errors.movieName && (
                <p className="text-sm text-red-500">{errors.movieName}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="space-y-2">
              <Label htmlFor="dateTime">Date and Time *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => handleInputChange('dateTime', e.target.value)}
                  min={getMinDateTime()}
                  className={`pl-10 ${errors.dateTime ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.dateTime && (
                <p className="text-sm text-red-500">{errors.dateTime}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Select the date and time for the movie screening
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter movie description"
                rows={6}
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
                {isSubmitting ? 'Registering...' : 'Register Movie'}
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

export default AddMoviePage;

