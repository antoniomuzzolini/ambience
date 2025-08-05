import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';
import { TokenStorage } from '../lib/tokenStorage';

// API functions for client-side authentication
async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
}

async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
}

async function verifyUserToken(token: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth?action=verify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    return null;
  }
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from stored token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = TokenStorage.getToken();
        if (!token) {
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const user = await verifyUserToken(token);
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Invalid token, remove it
          TokenStorage.removeToken();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        TokenStorage.removeToken();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await loginUser(credentials.email, credentials.password);

      if (response.success && response.user && response.token) {
        TokenStorage.setToken(response.token);
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Login failed',
        }));
      }

      return response;
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await registerUser(
        credentials.name,
        credentials.email,
        credentials.password
      );

      if (response.success && response.user && response.token) {
        TokenStorage.setToken(response.token);
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Registration failed',
        }));
      }

      return response;
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    TokenStorage.removeToken();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};