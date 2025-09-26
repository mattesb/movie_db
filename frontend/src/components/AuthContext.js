import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    console.log('Auth: Using env API URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  // Use dynamic values that React can't optimize away at build time
  const protocol = window['location']['protocol'];
  const hostname = window['location']['hostname'];
  const apiUrl = `${protocol}//${hostname}:5001`;
  console.log('Auth: Dynamic API URL detected:', apiUrl);
  return apiUrl;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/check`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login request error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (username, email, password, role = 'user') => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful registration, log the user in
        return await login(username, password);
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local state regardless of API response
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};