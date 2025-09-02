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
    activeAmbient,
    volume
  } = useAudioContext();

  const { toggleAmbient } = useAudioManager();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultSounds = [
    { id: 'city', name: 'Town Square', icon: '🏘️', file: 'city.mp3', source: 'builtin' as const },
    { id: 'waves', name: 'Coastal Waters', icon: '🌊', file: 'waves.mp3', source: 'builtin' as const },
    { id: 'wind', name: 'Mountain Winds', icon: '💨', file: 'wind.mp3', source: 'builtin' as const },
    { id: 'fire', name: 'Hearth Fire', icon: '🔥', file: 'fire.m4a', source: 'builtin' as const },
    { id: 'forest', name: 'Enchanted Woods', icon: '🌲', file: 'forest.mp3', source: 'builtin' as const },
    { id: 'rain', name: 'Storm Showers', icon: '🌧️', file: 'rain.m4a', source: 'builtin' as const },
    { id: 'war', name: 'Battle Grounds', icon: '⚔️', file: 'war.mp3', source: 'builtin' as const }
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
      <div className="medieval-card p-6 relative">
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l border-t border-medieval-gold/40"></div>
        <div className="absolute top-2 right-2 w-6 h-6 border-r border-t border-medieval-gold/40"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b border-medieval-gold/40"></div>
        <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b border-medieval-gold/40"></div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="medieval-heading text-xl font-semibold flex items-center gap-2 text-shadow-medieval">
            <Volume2 size={20} />
            Realm Ambience
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-medieval-parchment/70 medieval-text">
              Volume: {Math.round((volume?.ambient || 0.5) * 100)}%
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="medieval-btn medieval-btn-primary p-2 rounded"
              title="Customize Realm"
            >
              <Edit size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sounds.map(sound => {
            const audioSrc = getAudioSrc(sound);
            const displayName = getDisplayName(sound);
            const isActive = activeAmbient.includes(sound.id);
            
            return (
              <div key={`${sound.source}-${sound.id}`} className="text-center">
                <button
                  onClick={() => toggleAmbient(sound.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all medieval-text relative overflow-hidden ${
                    isActive
                      ? 'bg-medieval-forest border-medieval-gold text-medieval-parchment shadow-medieval-glow' 
                      : 'bg-medieval-brown/60 border-medieval-brown hover:bg-medieval-brown/80 hover:border-medieval-gold/50 text-medieval-parchment/90'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-medieval-gold/10 animate-pulse"></div>
                  )}
                  <div className="relative z-10">
                    <div className="text-3xl mb-2 filter drop-shadow-lg">{sound.icon}</div>
                    <div className="text-sm font-medium text-shadow-medieval">{displayName}</div>
                    {sound.source === 'uploaded' && (
                      <div className="text-xs text-medieval-gold mt-1 italic">Enchanted</div>
                    )}
                    <div className="mt-2 flex justify-center">
                      {isActive ? (
                        <div className="w-6 h-6 rounded-full bg-medieval-gold/20 flex items-center justify-center">
                          <Pause size={14} className="text-medieval-gold" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-medieval-brown/40 flex items-center justify-center">
                          <Play size={14} className="text-medieval-parchment/70" />
                        </div>
                      )}
                    </div>
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
        sectionTitle="Realm Ambience"
        onSave={handleSectionSave}
      />
    </>
  );
};