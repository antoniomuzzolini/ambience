import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Edit } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { useAudioManager } from '../../hooks/useAudioManager';
import { SectionEditModal } from '../SectionEditor/SectionEditModal';

interface Sound {
  id: string;
  name: string;
  icon: string;
  file?: string;
  url?: string;
  source: 'builtin' | 'uploaded';
}

export const AmbientSounds: React.FC = () => {
  const { 
    globalAmbientSounds,
    ambientRefs,
    isPlaying: { ambient: isPlaying },
    volume: { ambient: volume }
  } = useAudioContext();

  const { playAmbient, stopAmbient } = useAudioManager();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultSounds = [
    { id: 'city', name: 'City', icon: '🏙️', file: 'city.mp3', source: 'builtin' as const },
    { id: 'waves', name: 'Waves', icon: '🌊', file: 'waves.mp3', source: 'builtin' as const },
    { id: 'wind', name: 'Wind', icon: '💨', file: 'wind.mp3', source: 'builtin' as const },
    { id: 'fire', name: 'Fire', icon: '🔥', file: 'fire.m4a', source: 'builtin' as const },
    { id: 'forest', name: 'Forest', icon: '🌲', file: 'forest.mp3', source: 'builtin' as const },
    { id: 'rain', name: 'Rain', icon: '🌧️', file: 'rain.m4a', source: 'builtin' as const },
    { id: 'war', name: 'War', icon: '⚔️', file: 'war.mp3', source: 'builtin' as const }
  ];

  const fetchSectionConfig = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/sections?section=ambient', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSounds(result.sounds || defaultSounds);
        } else {
          setSounds(defaultSounds);
        }
      } else {
        setSounds(defaultSounds);
      }
    } catch (error) {
      console.error('Error fetching ambient section config:', error);
      setSounds(defaultSounds);
    }
  };

  useEffect(() => {
    fetchSectionConfig();
  }, []);

  const handleSectionSave = (newSounds: Sound[]) => {
    setSounds(newSounds);
  };

  const getAudioSrc = (sound: Sound) => {
    if (sound.source === 'uploaded') {
      return sound.url;
    }
    const customSound = globalAmbientSounds[sound.id];
    return customSound?.url || `/sounds/ambience/${sound.file}`;
  };

  const getDisplayName = (sound: Sound) => {
    if (sound.source === 'uploaded') {
      return sound.name;
    }
    const customSound = globalAmbientSounds[sound.id];
    return customSound?.name || sound.name;
  };

  return (
    <>
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Volume2 size={20} />
            Ambient Sounds
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">
              Volume: {Math.round(volume * 100)}%
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
              title="Edit Section"
            >
              <Edit size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sounds.map(sound => {
            const audioSrc = getAudioSrc(sound);
            const displayName = getDisplayName(sound);
            
            return (
              <div key={`${sound.source}-${sound.id}`} className="text-center">
                <button
                  onClick={() => isPlaying === sound.id ? stopAmbient() : playAmbient(sound.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    isPlaying === sound.id 
                      ? 'bg-green-600 border-green-500 text-white' 
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{sound.icon}</div>
                  <div className="text-sm font-medium">{displayName}</div>
                  {sound.source === 'uploaded' && (
                    <div className="text-xs text-blue-300 mt-1">Custom</div>
                  )}
                  <div className="mt-1">
                    {isPlaying === sound.id ? (
                      <Pause size={16} className="mx-auto" />
                    ) : (
                      <Play size={16} className="mx-auto" />
                    )}
                  </div>
                </button>
                
                <audio
                  ref={el => ambientRefs.current[sound.id] = el}
                  src={audioSrc}
                  loop
                  preload="none"
                />
              </div>
            );
          })}
        </div>
      </div>

      <SectionEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectionType="ambient"
        sectionTitle="Ambient Sounds"
        onSave={handleSectionSave}
      />
    </>
  );
};