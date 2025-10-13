// Validation utility functions

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex - at least 8 characters, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      message: 'Please enter your email address'
    };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return {
      isValid: false,
      message: 'Please enter a valid email address (e.g., user@example.com)'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      message: 'Please enter your password'
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return {
      isValid: false,
      message: 'Please enter a username'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates first name format
 * @param {string} firstName - First name to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateFirstName = (firstName) => {
  if (!firstName || firstName.trim() === '') {
    return {
      isValid: false,
      message: 'Please enter your first name'
    };
  }

  if (firstName.length < 2) {
    return {
      isValid: false,
      message: 'First name must be at least 2 characters long'
    };
  }

  if (firstName.length > 50) {
    return {
      isValid: false,
      message: 'First name must be less than 50 characters'
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const NAME_REGEX = /^[a-zA-Z\s\-']+$/;
  if (!NAME_REGEX.test(firstName)) {
    return {
      isValid: false,
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates last name format
 * @param {string} lastName - Last name to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateLastName = (lastName) => {
  if (!lastName || lastName.trim() === '') {
    return {
      isValid: false,
      message: 'Please enter your last name'
    };
  }

  if (lastName.length < 2) {
    return {
      isValid: false,
      message: 'Last name must be at least 2 characters long'
    };
  }

  if (lastName.length > 50) {
    return {
      isValid: false,
      message: 'Last name must be less than 50 characters'
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const NAME_REGEX = /^[a-zA-Z\s\-']+$/;
  if (!NAME_REGEX.test(lastName)) {
    return {
      isValid: false,
      message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates clients selection
 * @param {array} clients - Clients array to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateClients = (clients) => {
  if (!clients || !Array.isArray(clients) || clients.length === 0) {
    return {
      isValid: false,
      message: 'Please select at least one service'
    };
  }

  // Valid client options
  const validClients = ['bus', 'hotel', 'flight', 'taxi', 'movie', 'all'];
  
  // Check if all selected clients are valid
  const invalidClients = clients.filter(clientType => !validClients.includes(clientType));
  if (invalidClients.length > 0) {
    return {
      isValid: false,
      message: 'Please select valid services only'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - Validation result with isValid and message
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return {
      isValid: false,
      message: 'Please confirm your password'
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates login form data
 * @param {object} formData - Form data containing username and password
 * @returns {object} - Validation result with isValid, errors, and messages
 */
export const validateLoginForm = (formData) => {
  const usernameValidation = validateUsername(formData.username);
  const passwordValidation = validatePassword(formData.password);

  const errors = {};
  const messages = {};

  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.message;
    messages.username = usernameValidation.message;
  }

  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    messages.password = passwordValidation.message;
  }

  return {
    isValid: usernameValidation.isValid && passwordValidation.isValid,
    errors,
    messages
  };
};

/**
 * Validates sign-up form data
 * @param {object} formData - Form data containing username, email, password, firstName, lastName, clients, confirmPassword
 * @returns {object} - Validation result with isValid, errors, and messages
 */
export const validateSignUpForm = (formData) => {
  const usernameValidation = validateUsername(formData.username);
  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePassword(formData.password);
  const firstNameValidation = validateFirstName(formData.firstName);
  const clientsValidation = validateClients(formData.clients);
  const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);

  const errors = {};
  const messages = {};

  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.message;
    messages.username = usernameValidation.message;
  }

  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    messages.email = emailValidation.message;
  }

  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    messages.password = passwordValidation.message;
  }

  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.message;
    messages.firstName = firstNameValidation.message;
  }

  if (!clientsValidation.isValid) {
    errors.clients = clientsValidation.message;
    messages.clients = clientsValidation.message;
  }

  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.message;
    messages.confirmPassword = confirmPasswordValidation.message;
  }

  return {
    isValid: usernameValidation.isValid && 
             emailValidation.isValid && 
             passwordValidation.isValid && 
             firstNameValidation.isValid && 
             clientsValidation.isValid && 
             confirmPasswordValidation.isValid,
    errors,
    messages
  };
};

/**
 * Sanitizes input to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validates and sanitizes form data
 * @param {object} formData - Raw form data
 * @returns {object} - Sanitized and validated form data
 */
export const sanitizeFormData = (formData) => {
  return {
    username: sanitizeInput(formData.username),
    password: sanitizeInput(formData.password)
  };
};

/**
 * Validates and sanitizes sign-up form data
 * @param {object} formData - Raw form data
 * @returns {object} - Sanitized and validated form data
 */
export const sanitizeSignUpFormData = (formData) => {
  return {
    username: sanitizeInput(formData.username),
    email: sanitizeInput(formData.email),
    password: sanitizeInput(formData.password),
    firstName: sanitizeInput(formData.firstName),
    lastName: sanitizeInput(formData.lastName),
    clients: formData.clients // Array doesn't need sanitization, but validate it's an array
  };
};

/**
 * Validates bus name format
 * @param {string} busName - Bus name to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateBusName = (busName) => {
  if (!busName || busName.trim() === '') {
    return {
      isValid: false,
      message: 'Bus name is required'
    };
  }

  if (busName.trim().length < 2) {
    return {
      isValid: false,
      message: 'Bus name must be at least 2 characters long'
    };
  }

  if (busName.trim().length > 50) {
    return {
      isValid: false,
      message: 'Bus name must be less than 50 characters'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates bus number format
 * @param {string} busNumber - Bus number to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateBusNumber = (busNumber) => {
  if (!busNumber || busNumber.trim() === '') {
    return {
      isValid: false,
      message: 'Bus number is required'
    };
  }

  if (busNumber.trim().length < 3) {
    return {
      isValid: false,
      message: 'Bus number must be at least 3 characters long'
    };
  }

  if (busNumber.trim().length > 20) {
    return {
      isValid: false,
      message: 'Bus number must be less than 20 characters'
    };
  }

  // Check for valid bus number format (letters, numbers, hyphens)
  const BUS_NUMBER_REGEX = /^[a-zA-Z0-9\-]+$/;
  if (!BUS_NUMBER_REGEX.test(busNumber.trim())) {
    return {
      isValid: false,
      message: 'Bus number can only contain letters, numbers, and hyphens'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates bus type selection
 * @param {string} busType - Bus type to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateBusType = (busType) => {
  if (!busType || busType.trim() === '') {
    return {
      isValid: false,
      message: 'Bus type is required'
    };
  }

  const validBusTypes = ['Standard', 'Deluxe', 'Luxury', 'Sleeper', 'AC'];
  if (!validBusTypes.includes(busType)) {
    return {
      isValid: false,
      message: 'Please select a valid bus type'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates total seats number
 * @param {string|number} totalSeats - Total seats to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateTotalSeats = (totalSeats) => {
  if (!totalSeats || totalSeats === '') {
    return {
      isValid: false,
      message: 'Total seats is required'
    };
  }

  const seatsNumber = parseInt(totalSeats);
  if (isNaN(seatsNumber)) {
    return {
      isValid: false,
      message: 'Total seats must be a valid number'
    };
  }

  if (seatsNumber < 1) {
    return {
      isValid: false,
      message: 'Total seats must be at least 1'
    };
  }

  if (seatsNumber > 100) {
    return {
      isValid: false,
      message: 'Total seats cannot exceed 100'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates bus description
 * @param {string} description - Description to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateBusDescription = (description) => {
  // Description is optional, so empty is valid
  if (!description || description.trim() === '') {
    return {
      isValid: true,
      message: ''
    };
  }

  if (description.trim().length > 500) {
    return {
      isValid: false,
      message: 'Description must be less than 500 characters'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates bus amenities
 * @param {string} amenities - Amenities to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateBusAmenities = (amenities) => {
  // Amenities is optional, so empty is valid
  if (!amenities || amenities.trim() === '') {
    return {
      isValid: true,
      message: ''
    };
  }

  if (amenities.trim().length > 200) {
    return {
      isValid: false,
      message: 'Amenities must be less than 200 characters'
    };
  }

  // Check if amenities are properly comma-separated
  const amenityList = amenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
  if (amenityList.length > 10) {
    return {
      isValid: false,
      message: 'Maximum 10 amenities allowed'
    };
  }

  // Check individual amenity length
  for (const amenity of amenityList) {
    if (amenity.length > 30) {
      return {
        isValid: false,
        message: 'Each amenity must be less than 30 characters'
      };
    }
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates bus form data
 * @param {object} formData - Form data containing bus details
 * @returns {object} - Validation result with isValid, errors, and messages
 */
export const validateBusForm = (formData) => {
  const busNameValidation = validateBusName(formData.busName);
  const busNumberValidation = validateBusNumber(formData.busNumber);
  const busTypeValidation = validateBusType(formData.busType);
  const totalSeatsValidation = validateTotalSeats(formData.totalSeats);
  const descriptionValidation = validateBusDescription(formData.description);
  const amenitiesValidation = validateBusAmenities(formData.amenities);

  const errors = {};
  const messages = {};

  if (!busNameValidation.isValid) {
    errors.busName = busNameValidation.message;
    messages.busName = busNameValidation.message;
  }

  if (!busNumberValidation.isValid) {
    errors.busNumber = busNumberValidation.message;
    messages.busNumber = busNumberValidation.message;
  }

  if (!busTypeValidation.isValid) {
    errors.busType = busTypeValidation.message;
    messages.busType = busTypeValidation.message;
  }

  if (!totalSeatsValidation.isValid) {
    errors.totalSeats = totalSeatsValidation.message;
    messages.totalSeats = totalSeatsValidation.message;
  }

  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.message;
    messages.description = descriptionValidation.message;
  }

  if (!amenitiesValidation.isValid) {
    errors.amenities = amenitiesValidation.message;
    messages.amenities = amenitiesValidation.message;
  }

  return {
    isValid: busNameValidation.isValid && 
             busNumberValidation.isValid && 
             busTypeValidation.isValid && 
             totalSeatsValidation.isValid && 
             descriptionValidation.isValid && 
             amenitiesValidation.isValid,
    errors,
    messages
  };
};

export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFirstName,
  validateLastName,
  validateClients,
  validateConfirmPassword,
  validateLoginForm,
  validateSignUpForm,
  sanitizeInput,
  sanitizeFormData,
  sanitizeSignUpFormData,
  validateBusName,
  validateBusNumber,
  validateBusType,
  validateTotalSeats,
  validateBusDescription,
  validateBusAmenities,
  validateBusForm
};
