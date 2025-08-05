import React, { useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:block">{user.name}</span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-20">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-600">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Add settings functionality here if needed
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};