import React from 'react';
import { Music, Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionedTrackView } from '../components/TrackUpload/SectionedTrackView';

const TracksPage: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold truncate">🎧 My Tracks</h1>
            
            {/* Navigation - Always visible but icon-only on mobile */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className="bg-gray-700 hover:bg-gray-600 px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                title="Dashboard"
              >
                <Music size={16} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Dashboard</span>
              </Link>
              <Link
                to="/tracks"
                className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                title="My Tracks"
              >
                <Upload size={16} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">My Tracks</span>
              </Link>
            </nav>
          </div>
          
          <Link
            to="/"
            className="bg-gray-700 hover:bg-gray-600 px-2 sm:px-4 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Back</span>
          </Link>
        </div>

        {/* Description */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-gray-300">
            Upload and manage your custom audio tracks. Each section below shows your tracks organized by type, 
            with quick upload buttons to add more content to your D&D campaigns.
          </p>
        </div>

        {/* Sectioned Track View */}
        <SectionedTrackView />
      </div>
    </div>
  );
};

export default TracksPage;