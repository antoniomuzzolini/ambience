import React from 'react';
import { Music, Upload, ArrowLeft, Crown, Sword } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionedTrackView } from '../components/TrackUpload/SectionedTrackView';

const TracksPage: React.FC = () => {
  return (
    <div className="medieval-text text-medieval-parchment min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Medieval Header */}
        <div className="medieval-card p-6 mb-6 relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-medieval-gold opacity-50"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-medieval-gold opacity-50"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-medieval-gold opacity-50"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-medieval-gold opacity-50"></div>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <h1 className="medieval-heading text-xl sm:text-3xl truncate text-shadow-medieval-strong">
                ⚔️ Royal Arsenal
              </h1>
              
              {/* Medieval Navigation */}
              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/"
                  className="medieval-btn px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  title="Main Hall"
                >
                  <Crown size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Main Hall</span>
                </Link>
                <Link
                  to="/tracks"
                  className="medieval-btn medieval-btn-primary px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  title="Arsenal"
                >
                  <Sword size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Arsenal</span>
                </Link>
              </nav>
            </div>
            
            <Link
              to="/"
              className="medieval-btn px-2 sm:px-4 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              title="Return to Main Hall"
            >
              <ArrowLeft size={16} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Return</span>
            </Link>
          </div>
        </div>

        {/* Medieval Description */}
        <div className="medieval-card p-6 mb-6 relative">
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l border-t border-medieval-gold/40"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-r border-t border-medieval-gold/40"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b border-medieval-gold/40"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b border-medieval-gold/40"></div>
          
          <p className="text-medieval-parchment/90 medieval-text">
            🏹 <strong className="text-medieval-gold">Master's Arsenal:</strong> Upload and manage thy custom audio scrolls. Each section below displays thy tracks organized by purpose, 
            with swift upload enchantments to add more sonic treasures to thy campaigns.
          </p>
        </div>

        {/* Sectioned Track View */}
        <SectionedTrackView />
      </div>
    </div>
  );
};

export default TracksPage;