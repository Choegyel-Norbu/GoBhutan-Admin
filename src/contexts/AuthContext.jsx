import { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../lib/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Temporarily disabled auth
  const [isLoading, setIsLoading] = useState(false); // Skip loading for now

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userData = authAPI.getStoredUser();
        const authStatus = authAPI.isAuthenticated();
        
        setUser(userData);
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Update state with new user data
      const userData = authAPI.getStoredUser();
      setUser(userData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      // Clear state on login failure
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      
      // Update state with new user data
      const newUserData = authAPI.getStoredUser();
      setUser(newUserData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      // Clear state on signup failure
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear state regardless of API call result
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAuth = () => {
    try {
      const userData = authAPI.getStoredUser();
      const authStatus = authAPI.isAuthenticated();
      
      setUser(userData);
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    signOut,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
