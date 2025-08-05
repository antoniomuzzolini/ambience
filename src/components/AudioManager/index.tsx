import React from 'react';
import { Square, Settings } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { useAudioManager } from '../../hooks/useAudioManager';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAudioLoader } from '../../hooks/useAudioLoader';
import { VolumeControls } from './VolumeControls';
import { EnvironmentsList } from './EnvironmentsList';
import { AmbientSounds } from './AmbientSounds';
import { SoundEffects } from './SoundEffects';
import { EnvironmentEditor } from './EnvironmentEditor';

const AudioManager: React.FC = () => {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🎵 Ambience Manager</h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={stopAll}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2"
            >
              <Square size={16} />
              Stop All
            </button>
          </div>
        </div>

        {/* Volume Controls */}
        <VolumeControls showSettings={showSettings} />

        <div className="grid lg:grid-cols-3 gap-6">
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

export default AudioManager;