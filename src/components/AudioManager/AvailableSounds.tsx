import React from 'react';
import { Music, Download } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { availableAmbientFiles, availableEffectFiles } from '../../utils/audioLoader';

export const AvailableSounds: React.FC = () => {
  const { setGlobalAmbientSounds, setGlobalSpotSounds } = useAudioContext();

  const loadSoundManually = async (soundId: string, filePath: string, type: 'ambient' | 'effect') => {
    try {
      const audioFile = {
        url: filePath,
        name: filePath.split('/').pop() || 'Unknown'
      };

      if (type === 'ambient') {
        setGlobalAmbientSounds(prev => ({ ...prev, [soundId]: audioFile }));
      } else {
        setGlobalSpotSounds(prev => ({ ...prev, [soundId]: audioFile }));
      }

      console.log(`✅ Loaded ${soundId}: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to load ${soundId}:`, error);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Music size={18} />
        Available Sound Files
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Ambient Sounds */}
        <div>
          <h4 className="text-md font-medium mb-2 text-blue-400">🌧️ Ambient Sounds</h4>
          <div className="space-y-1">
            {Object.entries(availableAmbientFiles).map(([soundId, filePath]) => (
              <div key={soundId} className="flex items-center justify-between bg-gray-700 p-2 rounded text-sm">
                <span className="text-gray-300">{soundId}.{filePath.split('.').pop()}</span>
                <button
                  onClick={() => loadSoundManually(soundId, filePath, 'ambient')}
                  className="bg-blue-600 hover:bg-blue-700 p-1 rounded text-xs flex items-center gap-1"
                  title="Load this sound file"
                >
                  <Download size={12} />
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sound Effects */}
        <div>
          <h4 className="text-md font-medium mb-2 text-purple-400">⚡ Sound Effects</h4>
          <div className="space-y-1">
            {Object.entries(availableEffectFiles).map(([soundId, filePath]) => (
              <div key={soundId} className="flex items-center justify-between bg-gray-700 p-2 rounded text-sm">
                <span className="text-gray-300">{soundId}.{filePath.split('.').pop()}</span>
                <button
                  onClick={() => loadSoundManually(soundId, filePath, 'effect')}
                  className="bg-purple-600 hover:bg-purple-700 p-1 rounded text-xs flex items-center gap-1"
                  title="Load this sound file"
                >
                  <Download size={12} />
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-700 rounded">
        <p className="text-xs text-gray-400">
          💡 <strong>Tip:</strong> Click "Load" to manually load sound files from your /sounds directory. 
          Files will be automatically detected if your dev server is serving the /sounds folder.
        </p>
      </div>
    </div>
  );
};