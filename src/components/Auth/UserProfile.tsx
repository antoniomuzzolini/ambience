import React, { useState } from 'react';
import { User, LogOut, Crown } from 'lucide-react';
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
        className="medieval-btn flex items-center space-x-2 px-3 py-2 rounded-md transition-colors"
      >
        <Crown className="h-4 w-4" />
        <span className="hidden sm:block medieval-text font-medium">{user.username}</span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Medieval Dropdown */}
          <div className="absolute right-0 mt-2 w-48 medieval-card border-2 border-medieval-gold rounded-md shadow-medieval z-20">
            <div className="py-1">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-medieval-gold/30 bg-medieval-brown/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-medieval-gold rounded-full flex items-center justify-center">
                    <Crown className="h-4 w-4 text-medieval-brown-dark" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-medieval-gold medieval-text">
                      Lord {user.username}
                    </p>
                    <p className="text-xs text-medieval-parchment/70 medieval-text italic">
                      Master of Sound
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-3 text-sm medieval-text text-medieval-burgundy hover:bg-medieval-brown/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Depart from Realm</span>
              </button>
            </div>
            
            {/* Decorative bottom border */}
            <div className="h-1 bg-gradient-to-r from-transparent via-medieval-gold to-transparent"></div>
          </div>
        </>
      )}
    </div>
  );
};