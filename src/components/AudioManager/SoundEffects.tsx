import React, { useState, useEffect } from 'react';
import { Zap, Play, Edit } from 'lucide-react';
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

export const SoundEffects: React.FC = () => {
  const { 
    globalSpotSounds,
    spotRefs,
    volume
  } = useAudioContext();

  const { playSpot } = useAudioManager();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultSounds = [
    { id: 'explosion', name: 'Siege Blast', icon: '💥', file: 'explosion.mp3', source: 'builtin' as const },
    { id: 'thunder', name: 'Storm\'s Wrath', icon: '⚡', file: 'thunder.mp3', source: 'builtin' as const },
    { id: 'wolf', name: 'Dire Wolf', icon: '🐺', file: 'wolf.mp3', source: 'builtin' as const },
    { id: 'roar', name: 'Dragon\'s Cry', icon: '🐉', file: 'roar.mp3', source: 'builtin' as const }
  ];

  const fetchSectionConfig = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/sections?section=effect', {
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
      console.error('Error fetching effect section config:', error);
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
    const customSound = globalSpotSounds[sound.id];
    return customSound?.url || `/sounds/effects/${sound.file}`;
  };

  const getDisplayName = (sound: Sound) => {
    if (sound.source === 'uploaded') {
      return sound.name;
    }
    const customSound = globalSpotSounds[sound.id];
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
            <Zap size={20} />
            Arcane Effects
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-medieval-parchment/70 medieval-text">
              Volume: {Math.round((volume?.spot || 0.5) * 100)}%
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="medieval-btn medieval-btn-primary p-2 rounded"
              title="Customize Spells"
            >
              <Edit size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sounds.map(sound => {
            const audioSrc = getAudioSrc(sound);
            const displayName = getDisplayName(sound);
            
            return (
              <div key={`${sound.source}-${sound.id}`} className="text-center">
                <button
                  onClick={() => playSpot(sound.id)}
                  className="w-full p-4 rounded-lg border-2 bg-medieval-burgundy/60 border-medieval-burgundy hover:bg-medieval-burgundy/80 hover:border-medieval-gold/50 text-medieval-parchment/90 transition-all medieval-text relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-medieval-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="text-3xl mb-2 filter drop-shadow-lg">{sound.icon}</div>
                    <div className="text-sm font-medium text-shadow-medieval">{displayName}</div>
                    {sound.source === 'uploaded' && (
                      <div className="text-xs text-medieval-gold mt-1 italic">Enchanted</div>
                    )}
                    <div className="mt-2 flex justify-center">
                      <div className="w-6 h-6 rounded-full bg-medieval-burgundy/40 flex items-center justify-center group-hover:bg-medieval-gold/20 transition-colors">
                        <Play size={14} className="text-medieval-parchment/70 group-hover:text-medieval-gold" />
                      </div>
                    </div>
                  </div>
                </button>
                
                <audio
                  ref={el => spotRefs.current[sound.id] = el}
                  src={audioSrc}
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
        sectionType="effect"
        sectionTitle="Arcane Effects"
        onSave={handleSectionSave}
      />
    </>
  );
};