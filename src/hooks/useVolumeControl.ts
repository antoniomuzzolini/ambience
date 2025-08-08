import { useCallback } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { VolumeType, PlayingState } from '../types/audio';
import { changeVolume } from '../utils/audioFade';
import { useAudioManager } from './useAudioManager';

export const useVolumeControl = () => {
  const {
    volumes,
    setVolumes,
    activeAmbient,
    currentPlayingEnv,
    isPlaying,
    fadeSettings,
    audioRefs,
    ambientRefs
  } = useAudioContext();
  
  const { updateSeamlessLooperVolumes } = useAudioManager();

  const updateVolume = useCallback(async (type: VolumeType, value: number) => {
    setVolumes(prev => ({ ...prev, [type]: value }));
    
    const fadeDuration = fadeSettings.enabled ? Math.min(fadeSettings.duration * 0.5, 1) : 0;
    
    if (type === 'ambient') {
      // Update volume for seamless loopers
      await updateSeamlessLooperVolumes(value);
      
      // Update volume for regular ambient sounds (fallback)
      const updatePromises = activeAmbient.map(soundId => {
        const audioElement = ambientRefs.current[soundId];
        if (audioElement && !audioElement.paused) {
          return fadeDuration > 0 
            ? changeVolume(audioElement, value, fadeDuration)
            : Promise.resolve((audioElement.volume = value));
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    } else if (type === 'music') {
      // Update volume for currently playing music track
      const activeTrackTypes: (keyof PlayingState)[] = ['combat', 'exploration', 'tension'];
      const updatePromises = activeTrackTypes.map(trackType => {
        if (isPlaying[trackType]) {
          const activeAudioKey = `${currentPlayingEnv}_${trackType}`;
          const audioElement = audioRefs.current[activeAudioKey];
          if (audioElement && !audioElement.paused) {
            return fadeDuration > 0 
              ? changeVolume(audioElement, value, fadeDuration)
              : Promise.resolve((audioElement.volume = value));
          }
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    }
  }, [volumes, setVolumes, activeAmbient, currentPlayingEnv, isPlaying, fadeSettings, audioRefs, ambientRefs]);

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