import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Re-export the useAuth hook from context for convenience
export { useAuth } from '../context/AuthContext';

// Additional auth hooks can be added here if needed
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    user,
    isLoggedIn: isAuthenticated && !isLoading,
  };
};

export const useAuthActions = () => {
  const { login, register, logout, clearError } = useAuth();
  
  return {
    login,
    register,
    logout,
    clearError,
  };
};