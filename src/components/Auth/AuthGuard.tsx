import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Login } from './Login';
import { Register } from './Register';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If user is not authenticated, show login/register forms
  return (
    <div>
      {isLoginMode ? (
        <Login onToggleMode={() => setIsLoginMode(false)} />
      ) : (
        <Register onToggleMode={() => setIsLoginMode(true)} />
      )}
    </div>
  );
};