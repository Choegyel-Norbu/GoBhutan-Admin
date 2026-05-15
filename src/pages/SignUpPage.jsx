import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateSignUpForm, sanitizeSignUpFormData } from '../lib/validation';
import authAPI from '../lib/authAPI';
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Colors, colorsRgb } from '../lib/colors';
import yayaLogo from '@/assets/images/yaya-logo.png';

// DotMap Component for animated background
const DotMap = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Set up routes that will animate across the map
  const routes = [
    {
      start: { x: 100, y: 150, delay: 0 },
      end: { x: 200, y: 80, delay: 2 },
      color: Colors.primary,
    },
    {
      start: { x: 200, y: 80, delay: 2 },
      end: { x: 260, y: 120, delay: 4 },
      color: Colors.primary,
    },
    {
      start: { x: 50, y: 50, delay: 1 },
      end: { x: 150, y: 180, delay: 3 },
      color: Colors.primary,
    },
    {
      start: { x: 280, y: 60, delay: 0.5 },
      end: { x: 180, y: 180, delay: 2.5 },
      color: Colors.primary,
    },
  ];

  // Create dots for the world map
  const generateDots = (width, height) => {
    const dots = [];
    const gap = 12;
    const dotRadius = 1;

    // Create a dot grid pattern with random opacity
    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Shape the dots to form a world map silhouette
        const isInMapShape =
          // North America
          ((x < width * 0.25 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
          // South America
          ((x < width * 0.25 && x > width * 0.15) && (y < height * 0.8 && y > height * 0.4)) ||
          // Europe
          ((x < width * 0.45 && x > width * 0.3) && (y < height * 0.35 && y > height * 0.15)) ||
          // Africa
          ((x < width * 0.5 && x > width * 0.35) && (y < height * 0.65 && y > height * 0.35)) ||
          // Asia
          ((x < width * 0.7 && x > width * 0.45) && (y < height * 0.5 && y > height * 0.1)) ||
          // Australia
          ((x < width * 0.8 && x > width * 0.65) && (y < height * 0.8 && y > height * 0.6));

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.2,
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId;
    let startTime = Date.now();

    // Draw background dots
    function drawDots() {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw the dots
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorsRgb.primary.r}, ${colorsRgb.primary.g}, ${colorsRgb.primary.b}, ${dot.opacity})`;
        ctx.fill();
      });
    }

    // Draw animated routes
    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000;
      
      routes.forEach(route => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        
        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;
        
        // Draw the route line
        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw the start point
        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();
        
        // Draw the moving point
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = Colors.primary;
        ctx.fill();
        
        // Add glow effect to the moving point
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorsRgb.primary.r}, ${colorsRgb.primary.g}, ${colorsRgb.primary.b}, 0.35)`;
        ctx.fill();
        
        // If the route is complete, draw the end point
        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    }
    
    // Animation loop
    function animate() {
      drawDots();
      drawRoutes();
      
      // If all routes are complete, restart the animation
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) {
        startTime = Date.now();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

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
    
    // Mark all fields as touched (except lastName which is optional)
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      firstName: true,
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
            message: 'Account created successfully! You can sign in to continue.',
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
    
    // Define all available services (removed flight)
    const allServices = ['bus', 'hotel', 'theater'];
    
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-card text-card-foreground shadow-xl border border-border"
      >
        {/* Left side - Map */}
        <div className="hidden md:block w-1/2 h-[800px] relative overflow-hidden border-r border-border">
          <div className="absolute inset-0 bg-background">
            <DotMap />
            
            {/* Logo and text overlay — frosted panel so copy stays readable over the map */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <div className="w-full max-w-md rounded-2xl border border-border/80 bg-background/90 px-8 py-10 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mb-8 flex justify-center"
                >
                  <img
                    src={yayaLogo}
                    alt="YaYa logo"
                    className="h-32 w-auto max-w-[min(100%,300px)] md:h-44 md:max-w-[min(100%,380px)] rounded-xl object-contain border border-border/50 bg-card/50 p-2"
                  />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="text-4xl md:text-5xl font-bold mb-4 text-center text-foreground tracking-tight"
                >
                  YaYa Admin
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-sm md:text-base text-center text-foreground/90 max-w-sm mx-auto leading-relaxed"
                >
                  Create your account to access the YaYa admin dashboard and manage travel reservations across Bhutan
                </motion.p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Sign Up Form */}
        <div className="w-full md:w-1/2 h-[800px] p-8 md:p-10 flex flex-col justify-start bg-card overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex flex-col items-center gap-3 md:hidden">
              <img
                src={yayaLogo}
                alt="YaYa logo"
                className="h-24 w-auto max-w-[260px] rounded-xl object-contain border border-border bg-card/40 p-2"
              />
              <p className="text-lg font-semibold text-foreground">YaYa Admin</p>
            </div>
            <h1 className="text-2xl md:text-2xl font-bold mb-1 text-foreground">Create Account</h1>
            <p className="text-foreground/85 mb-8 text-xs md:text-sm">Join YaYa Admin and start managing travel reservations across Bhutan!</p>
            
            <form onSubmit={handleSubmit}>
              {/* Submit Error Display */}
              {submitError && (
                <div className="bg-destructive/10 border border-destructive/25 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-destructive">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Form Fields */}
              <div className="space-y-5 max-h-96 overflow-y-auto pr-2">

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name Field */}
                  <div>
                    <label 
                      htmlFor="firstName" 
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      First Name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        touched.firstName && validationErrors.firstName 
                          ? 'border-destructive/60 focus-visible:ring-destructive' 
                          : 'border-border'
                      }`}
                      placeholder="First name"
                      aria-describedby="firstName-error"
                      disabled={isLoading}
                    />
                    {touched.firstName && validationErrors.firstName && (
                      <p id="firstName-error" className="mt-1 text-sm text-destructive">
                        {validationErrors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div>
                    <label 
                      htmlFor="lastName" 
                      className="block text-sm font-medium text-foreground mb-1"
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
                      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        touched.lastName && validationErrors.lastName 
                          ? 'border-destructive/60 focus-visible:ring-destructive' 
                          : 'border-border'
                      }`}
                      placeholder="Last name"
                      aria-describedby="lastName-error"
                      disabled={isLoading}
                    />
                    {touched.lastName && validationErrors.lastName && (
                      <p id="lastName-error" className="mt-1 text-sm text-destructive">
                        {validationErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Username Field */}
                <div>
                  <label 
                    htmlFor="username" 
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Username <span className="text-primary">*</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      touched.username && validationErrors.username 
                        ? 'border-destructive/60 focus-visible:ring-destructive' 
                        : 'border-border'
                    }`}
                    placeholder="Enter your username"
                    aria-describedby="username-error"
                    disabled={isLoading}
                  />
                  {touched.username && validationErrors.username && (
                    <p id="username-error" className="mt-1 text-sm text-destructive">
                      {validationErrors.username}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Email address <span className="text-primary">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      touched.email && validationErrors.email 
                        ? 'border-destructive/60 focus-visible:ring-destructive' 
                        : 'border-border'
                    }`}
                    placeholder="Enter your email"
                    aria-describedby="email-error"
                    disabled={isLoading}
                  />
                  {touched.email && validationErrors.email && (
                    <p id="email-error" className="mt-1 text-sm text-destructive">
                      {validationErrors.email}
                    </p>
                  )}
                </div>


                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Password <span className="text-primary">*</span>
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
                      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        touched.password && validationErrors.password 
                          ? 'border-destructive/60 focus-visible:ring-destructive' 
                          : 'border-border'
                      }`}
                      placeholder="Create a password"
                      aria-describedby="password-error"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.password && validationErrors.password && (
                    <p id="password-error" className="mt-1 text-sm text-destructive">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Confirm Password <span className="text-primary">*</span>
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
                      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        touched.confirmPassword && validationErrors.confirmPassword 
                          ? 'border-destructive/60 focus-visible:ring-destructive' 
                          : 'border-border'
                      }`}
                      placeholder="Confirm your password"
                      aria-describedby="confirmPassword-error"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.confirmPassword && validationErrors.confirmPassword && (
                    <p id="confirmPassword-error" className="mt-1 text-sm text-destructive">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Clients Selection Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Services <span className="text-primary">*</span>
                  </label>
                  <div className="space-y-3">
                    {/* First Row: Bus, Hotel, Theater */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <input
                          id="bus-client"
                          name="clients"
                          type="checkbox"
                          value="bus"
                          checked={formData.clients.includes('bus')}
                          onChange={handleClientsChange}
                          onBlur={handleInputBlur}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded disabled:opacity-50"
                          disabled={isLoading}
                        />
                        <label htmlFor="bus-client" className="ml-2 block text-sm text-foreground">
                          Bus
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
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded disabled:opacity-50"
                          disabled={isLoading}
                        />
                        <label htmlFor="hotel-client" className="ml-2 block text-sm text-foreground">
                          Hotel
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="theater-client"
                          name="clients"
                          type="checkbox"
                          value="theater"
                          checked={formData.clients.includes('theater')}
                          onChange={handleClientsChange}
                          onBlur={handleInputBlur}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded disabled:opacity-50"
                          disabled={isLoading}
                        />
                        <label htmlFor="theater-client" className="ml-2 block text-sm text-foreground">
                          Theater
                        </label>
                      </div>
                    </div>
                    
                    {/* Second Row: All Services */}
                    <div className="flex items-center mb-4">
                      <input
                        id="all-client"
                        name="clients"
                        type="checkbox"
                        value="all"
                        checked={formData.clients.includes('all')}
                        onChange={handleClientsChange}
                        onBlur={handleInputBlur}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded disabled:opacity-50"
                        disabled={isLoading}
                      />
                      <label htmlFor="all-client" className="ml-2 block text-sm text-foreground">
                        All Services
                      </label>
                    </div>
                  </div>
                  
                  {/* Note */}
                  <div className="mt-2 mb-4">
                    <p className="text-xs text-muted-foreground italic">
                      Note: You can select multiple services if you own them.
                    </p>
                  </div>
                  
                  {touched.clients && validationErrors.clients && (
                    <p id="clients-error" className="mt-2 text-sm text-destructive">
                      {validationErrors.clients}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="pt-2 mt-2"
              >
                <button
                  type="submit"
                  onClick={createAccount}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  <span className="flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </span>
                </button>
              </motion.div>
              
              {/* Sign In Link */}
              <div className="text-center mt-6">
                <p className="form-field-hint md:text-sm">
                  Already have an account?{' '}
                  <Link 
                    to="/signin" 
                    className="text-primary hover:text-primary/80 text-sm transition-colors font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Terms and Privacy */}
              <div className="text-center pt-4 border-t border-border mt-4">
                <p className="form-field-hint">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
