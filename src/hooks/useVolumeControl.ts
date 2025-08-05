import { useCallback } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { VolumeType, PlayingState } from '../types/audio';

export const useVolumeControl = () => {
  const {
    volumes,
    setVolumes,
    activeAmbient,
    currentPlayingEnv,
    isPlaying,
    audioRefs,
    ambientRefs
  } = useAudioContext();

  const updateVolume = useCallback((type: VolumeType, value: number) => {
    setVolumes(prev => ({ ...prev, [type]: value }));
    
    if (type === 'ambient') {
      activeAmbient.forEach(soundId => {
        const audioElement = ambientRefs.current[soundId];
        if (audioElement) {
          audioElement.volume = value;
        }
      });
    } else if (type === 'music') {
      const activeTrackTypes: (keyof PlayingState)[] = ['combat', 'exploration', 'sneak'];
      activeTrackTypes.forEach(trackType => {
        const activeAudioKey = `${currentPlayingEnv}_${trackType}`;
        const audioElement = audioRefs.current[activeAudioKey];
        if (audioElement && isPlaying[trackType]) {
          audioElement.volume = value;
        }
      });
    }
  }, [volumes, setVolumes, activeAmbient, currentPlayingEnv, isPlaying, audioRefs, ambientRefs]);

  const getVolumeLabel = useCallback((volumeType: VolumeType) => {
    switch(volumeType) {
      case 'music': return 'Music Tracks';
      case 'ambient': return 'Ambient Sounds';
      case 'spot': return 'Sound Effects';
      default: return volumeType;
    }
  }, []);

  return {
    volumes,
    updateVolume,
    getVolumeLabel
  };
};