import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateSignUpForm, sanitizeSignUpFormData } from '../lib/validation';
import authAPI from '../lib/authAPI';

const SignUpPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    clients: []
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear any existing error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If password changes, also validate confirmPassword if it has been touched
    if (name === 'password' && touched.confirmPassword && formData.confirmPassword) {
      const validation = validateSignUpForm({
        password: value,
        confirmPassword: formData.confirmPassword
      });
      if (!validation.isValid && validation.errors.confirmPassword) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: validation.errors.confirmPassword
        }));
      } else if (validation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const handleInputBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // For confirmPassword, we need to validate against the password field
    if (name === 'confirmPassword') {
      const validation = validateSignUpForm({
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      if (!validation.isValid && validation.errors.confirmPassword) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: validation.errors.confirmPassword
        }));
      }
    } else {
      // Validate the field on blur
      const validation = validateSignUpForm({ [name]: formData[name] });
      if (!validation.isValid && validation.errors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: validation.errors[name]
        }));
      }
    }
  };

  const createAccount = async () => {
    // Clear previous errors
    setSubmitError('');
    setValidationErrors({});
    
    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      firstName: true,
      lastName: true,
      clients: true
    });
    
    // Validate form data
    const validation = validateSignUpForm(formData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    // Sanitize form data
    const sanitizedData = sanitizeSignUpFormData(formData);
    
    setIsLoading(true);
    
    try {
      // Attempt sign up
      const response = await authAPI.signup(sanitizedData);
      
      // Check if signup was successful (status 201)
      if (response.status === 201) {
        console.log('Account created successfully:', response.data);
        
        // Store credentials for auto-fill on sign-in page
        localStorage.setItem('tempCredentials', JSON.stringify({
          username: sanitizedData.username,
          password: sanitizedData.password
        }));
        
        // Redirect to sign-in page with success message
        navigate('/signin', { 
          state: { 
            message: 'Account created successfully! Please sign in to continue.',
            autoFill: true 
          } 
        });
      } else {
        throw new Error('Unexpected response status');
      }
      
    } catch (error) {
      console.error('Account creation error:', error);
      setSubmitError(error.message || 'Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAccount();
  };

  const handleGoogleSignUp = () => {
    // Handle Google sign-up logic here
    console.log('Google sign-up attempt');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleClientsChange = (e) => {
    const { value, checked } = e.target;
    
    // Define all available services
    const allServices = ['bus', 'hotel', 'flight', 'taxi', 'movie'];
    
    if (value === 'all') {
      // If "All Services Client" is checked, select all services
      if (checked) {
        setFormData(prev => ({
          ...prev,
          clients: ['all', ...allServices]
        }));
      } else {
        // If "All Services Client" is unchecked, deselect all
        setFormData(prev => ({
          ...prev,
          clients: []
        }));
      }
    } else {
      // Handle individual service selection
      let newClients;
      if (checked) {
        // Add the service to the list
        newClients = [...formData.clients, value];
        
        // If all individual services are now selected, also select "all"
        const hasAllIndividualServices = allServices.every(service => 
          newClients.includes(service)
        );
        if (hasAllIndividualServices) {
          newClients = ['all', ...allServices];
        }
      } else {
        // Remove the service from the list and also remove "all" if it exists
        newClients = formData.clients.filter(item => item !== value && item !== 'all');
      }
      
      setFormData(prev => ({
        ...prev,
        clients: newClients
      }));
    }
    
    // Clear any existing error for this field
    if (validationErrors.clients) {
      setValidationErrors(prev => ({
        ...prev,
        clients: ''
      }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Sign Up Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600 text-sm">
              Join us today and start managing your reservations!
            </p>
          </div>

          {/* Separator */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Registration Form</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Submit Error Display */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Form Fields */}
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name Field */}
              <div>
                <label 
                  htmlFor="firstName" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full px-3 py-3 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-gray-400 ${
                    touched.firstName && validationErrors.firstName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="First name"
                  aria-describedby="firstName-error"
                  disabled={isLoading}
                />
                {touched.firstName && validationErrors.firstName && (
                  <p id="firstName-error" className="mt-2 text-sm text-red-600">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <label 
                  htmlFor="lastName" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full px-3 py-3 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-gray-400 ${
                    touched.lastName && validationErrors.lastName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                  aria-describedby="lastName-error"
                  disabled={isLoading}
                />
                {touched.lastName && validationErrors.lastName && (
                  <p id="lastName-error" className="mt-2 text-sm text-red-600">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={`w-full px-3 py-3 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-gray-400 ${
                  touched.username && validationErrors.username 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter your username"
                aria-describedby="username-error"
                disabled={isLoading}
              />
              {touched.username && validationErrors.username && (
                <p id="username-error" className="mt-2 text-sm text-red-600">
                  {validationErrors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={`w-full px-3 py-3 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-gray-400 ${
                  touched.email && validationErrors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                aria-describedby="email-error"
                disabled={isLoading}
              />
              {touched.email && validationErrors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>


            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full px-3 py-3 pr-12 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-gray-400 ${
                    touched.password && validationErrors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                  aria-describedby="password-error"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && validationErrors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}
              <div className="mt-2 text-sm text-gray-600">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full px-3 py-3 pr-12 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-gray-400 ${
                    touched.confirmPassword && validationErrors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  aria-describedby="confirmPassword-error"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.confirmPassword && validationErrors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-2 text-sm text-red-600">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Clients Selection Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Services
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="bus-client"
                    name="clients"
                    type="checkbox"
                    value="bus"
                    checked={formData.clients.includes('bus')}
                    onChange={handleClientsChange}
                    onBlur={handleInputBlur}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <label htmlFor="bus-client" className="ml-2 block text-sm text-gray-900">
                    Bus Client
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="hotel-client"
                    name="clients"
                    type="checkbox"
                    value="hotel"
                    checked={formData.clients.includes('hotel')}
                    onChange={handleClientsChange}
                    onBlur={handleInputBlur}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <label htmlFor="hotel-client" className="ml-2 block text-sm text-gray-900">
                    Hotel Client
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="flight-client"
                    name="clients"
                    type="checkbox"
                    value="flight"
                    checked={formData.clients.includes('flight')}
                    onChange={handleClientsChange}
                    onBlur={handleInputBlur}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <label htmlFor="flight-client" className="ml-2 block text-sm text-gray-900">
                    Flight Client
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="taxi-client"
                    name="clients"
                    type="checkbox"
                    value="taxi"
                    checked={formData.clients.includes('taxi')}
                    onChange={handleClientsChange}
                    onBlur={handleInputBlur}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <label htmlFor="taxi-client" className="ml-2 block text-sm text-gray-900">
                    Taxi Client
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="movie-client"
                    name="clients"
                    type="checkbox"
                    value="movie"
                    checked={formData.clients.includes('movie')}
                    onChange={handleClientsChange}
                    onBlur={handleInputBlur}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <label htmlFor="movie-client" className="ml-2 block text-sm text-gray-900">
                    Movie Client
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="all-client"
                    name="clients"
                    type="checkbox"
                    value="all"
                    checked={formData.clients.includes('all')}
                    onChange={handleClientsChange}
                    onBlur={handleInputBlur}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <label htmlFor="all-client" className="ml-2 block text-sm text-gray-900">
                    All Services Client
                  </label>
                </div>
              </div>
              {touched.clients && validationErrors.clients && (
                <p id="clients-error" className="mt-2 text-sm text-red-600">
                  {validationErrors.clients}
                </p>
              )}
            </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                onClick={createAccount}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:bg-indigo-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/signin" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center pt-4 border-t border-gray-200 mt-4">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 GoBhutan Reservations. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
