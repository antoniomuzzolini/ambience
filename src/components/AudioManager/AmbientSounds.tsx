import React from 'react';
import { Wind, Volume2, VolumeX } from 'lucide-react';
import { useAudioContext, predefinedAmbient } from '../../context/AudioContext';
import { useEnvironments } from '../../hooks/useEnvironments';
import { useAudioManager } from '../../hooks/useAudioManager';
import { FileUpload } from '../ui/FileUpload';

export const AmbientSounds: React.FC = () => {
  const { globalAmbientSounds, activeAmbient, ambientRefs } = useAudioContext();
  const { handleGlobalAmbientUpload } = useEnvironments();
  const { toggleAmbient } = useAudioManager();

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Wind size={20} />
        Ambient Sounds
      </h2>
      
      <div className="grid grid-cols-2 gap-2">
        {predefinedAmbient.map(ambient => (
          <div key={ambient.id} className="p-2 bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {ambient.icon} {ambient.name}
              </span>
              <button
                onClick={() => toggleAmbient(ambient.id)}
                className={`p-1 rounded text-xs ${
                  activeAmbient.includes(ambient.id)
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                disabled={!globalAmbientSounds[ambient.id]}
              >
                {activeAmbient.includes(ambient.id) ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            </div>
            
            {globalAmbientSounds[ambient.id] ? (
              <audio
                ref={el => ambientRefs.current[ambient.id] = el}
                src={globalAmbientSounds[ambient.id].url}
              />
            ) : (
              <FileUpload
                onFileSelect={(file) => handleGlobalAmbientUpload(ambient.id, file)}
                label="Upload"
                className="!p-1 !gap-1 text-xs"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};