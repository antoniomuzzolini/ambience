import React from 'react';
import { Music, Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrackManager } from '../components/TrackUpload/TrackManager';

const TracksPage: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">🎧 My Tracks</h1>
            
            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Music size={16} />
                Dashboard
              </Link>
              <Link
                to="/tracks"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Upload size={16} />
                My Tracks
              </Link>
            </nav>
          </div>
          
          <Link
            to="/"
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded flex items-center gap-2"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        {/* Description */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-gray-300">
            Upload and manage your custom audio tracks. Organize them by type (Music, Ambient, Effects) 
            and use them in your D&D campaigns alongside the built-in sounds.
          </p>
        </div>

        {/* Track Manager */}
        <TrackManager />
      </div>
    </div>
  );
};

export default TracksPage;