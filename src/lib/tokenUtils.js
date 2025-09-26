/**
 * JWT Token Utilities
 * Functions to decode and extract information from JWT tokens
 */

/**
 * Decode JWT token without verification (client-side only)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token) {
    return null;
  }

  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Extract roles from JWT token
 * @param {string} token - JWT access token
 * @returns {Array} - Array of roles
 */
export const extractRolesFromToken = (token) => {
  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return [];
  }

  // Extract roles from different possible locations in the token
  const roles = [];

  // Check realm_access.roles (Keycloak standard)
  if (decoded.realm_access?.roles) {
    roles.push(...decoded.realm_access.roles);
  }

  // Check resource_access for specific client roles
  if (decoded.resource_access) {
    Object.values(decoded.resource_access).forEach(resource => {
      if (resource.roles) {
        roles.push(...resource.roles);
      }
    });
  }

  // Check for custom role fields
  if (decoded.roles) {
    roles.push(...decoded.roles);
  }

  // Check for client-specific roles
  if (decoded.client_roles) {
    roles.push(...decoded.client_roles);
  }

  // Remove duplicates and filter out default roles
  const uniqueRoles = [...new Set(roles)].filter(role => 
    !['default-roles-go-bhutan', 'offline_access', 'uma_authorization'].includes(role)
  );

  return uniqueRoles;
};

/**
 * Extract user information from JWT token
 * @param {string} token - JWT access token
 * @returns {object} - User information object
 */
export const extractUserInfoFromToken = (token) => {
  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return null;
  }

  return {
    sub: decoded.sub, // Subject (user ID)
    username: decoded.preferred_username || decoded.username,
    name: decoded.name,
    given_name: decoded.given_name,
    family_name: decoded.family_name,
    email: decoded.email,
    email_verified: decoded.email_verified,
    roles: extractRolesFromToken(token),
    clients: decoded.clients || [],
    keycloakId: decoded.sub,
    userId: decoded.userId || decoded.sub,
    exp: decoded.exp, // Expiration timestamp
    iat: decoded.iat, // Issued at timestamp
    iss: decoded.iss, // Issuer
    aud: decoded.aud, // Audience
    scope: decoded.scope
  };
};
