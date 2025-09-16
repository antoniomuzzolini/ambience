import React from 'react';
import { Square, Settings, Upload, Music, Sword, Shield, Crown } from 'lucide-react';
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
    <div className="medieval-text text-medieval-parchment p-4">
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
                ⚔️ Master's Chamber
              </h1>
              
              {/* Medieval Navigation */}
              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/"
                  className="medieval-btn medieval-btn-primary px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  title="Main Hall"
                >
                  <Crown size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Main Hall</span>
                </Link>
                <Link
                  to="/tracks"
                  className="medieval-btn px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  title="Arsenal"
                >
                  <Sword size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Arsenal</span>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="medieval-btn p-2 rounded"
                title="Settings"
              >
                <Settings size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={stopAll}
                className="medieval-btn medieval-btn-danger px-2 sm:px-4 py-2 rounded flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                title="Silence All"
              >
                <Shield size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Silence All</span>
              </button>
            </div>
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
        
        {/* Medieval Footer Quote */}
        <div className="text-center mt-8 opacity-70">
          <p className="medieval-text italic text-medieval-gold text-sm">
            "In the realm of sound, the master weaves tales untold..."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;