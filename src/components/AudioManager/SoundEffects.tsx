import React from 'react';
import { Zap, Play } from 'lucide-react';
import { useAudioContext, predefinedSpots } from '../../context/AudioContext';
import { useEnvironments } from '../../hooks/useEnvironments';
import { useAudioManager } from '../../hooks/useAudioManager';
import { FileUpload } from '../ui/FileUpload';

export const SoundEffects: React.FC = () => {
  const { globalSpotSounds, spotRefs } = useAudioContext();
  const { handleGlobalSpotUpload } = useEnvironments();
  const { playSpot } = useAudioManager();

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Zap size={20} />
        Sound Effects
      </h2>
      
      <div className="grid grid-cols-2 gap-2">
        {predefinedSpots.map(spot => (
          <div key={spot.id} className="p-2 bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {spot.icon} {spot.name}
              </span>
              <div className="flex items-center gap-1">
                <kbd className="bg-gray-600 px-1 rounded text-xs">{spot.key}</kbd>
                <button
                  onClick={() => playSpot(spot.id)}
                  className="p-1 rounded text-xs bg-purple-600 hover:bg-purple-700"
                  disabled={!globalSpotSounds[spot.id]}
                >
                  <Play size={12} />
                </button>
              </div>
            </div>
            
            {globalSpotSounds[spot.id] ? (
              <audio
                ref={el => spotRefs.current[spot.id] = el}
                src={globalSpotSounds[spot.id].url}
              />
            ) : (
              <FileUpload
                onFileSelect={(file) => handleGlobalSpotUpload(spot.id, file)}
                label="Upload"
                className="!p-1 !gap-1 text-xs"
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-2 bg-gray-700 rounded">
        <p className="text-xs text-gray-400">
          💡 Use number keys (1-6) to quickly trigger sound effects!
        </p>
      </div>
    </div>
  );
};