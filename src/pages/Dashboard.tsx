import React from 'react';
import { Square, Settings, Upload, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAudioContext } from '../context/AudioContext';
import { useAudioManager } from '../hooks/useAudioManager';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAudioLoader } from '../hooks/useAudioLoader';
import { VolumeControls } from '../components/AudioManager/VolumeControls';
import { EnvironmentsList } from '../components/AudioManager/EnvironmentsList';
import { AmbientSounds } from '../components/AudioManager/AmbientSounds';
import { SoundEffects } from '../components/AudioManager/SoundEffects';
import { EnvironmentEditor } from '../components/AudioManager/EnvironmentEditor';

const Dashboard: React.FC = () => {
  const { editingEnvironment, showSettings, setShowSettings } = useAudioContext();
  const { stopAll } = useAudioManager();
  
  // Initialize keyboard shortcuts and audio loader
  useKeyboardShortcuts();
  useAudioLoader();

  // If editing an environment, show the editor
  if (editingEnvironment) {
    return <EnvironmentEditor />;
  }

  // Main Dashboard View
  return (
    <div className="bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold truncate">🎵 Ambience Manager</h1>
            
            {/* Navigation - Hidden on very small screens */}
            <nav className="hidden xs:flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Music size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                to="/tracks"
                className="bg-gray-700 hover:bg-gray-600 px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Upload size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">My Tracks</span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded"
              title="Settings"
            >
              <Settings size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={stopAll}
              className="bg-red-600 hover:bg-red-700 px-2 sm:px-4 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              title="Stop All Sounds"
            >
              <Square size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Stop All</span>
            </button>
          </div>
        </div>

        {/* Volume Controls */}
        <VolumeControls showSettings={showSettings} />

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Environments */}
          <EnvironmentsList />

          {/* Ambient Sounds */}
          <AmbientSounds />

          {/* Sound Effects */}
          <SoundEffects />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;