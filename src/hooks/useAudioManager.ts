import { useCallback } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { TrackType } from '../types/audio';

export const useAudioManager = () => {
  const {
    environments,
    isPlaying,
    setIsPlaying,
    currentPlayingEnv,
    setCurrentPlayingEnv,
    volumes,
    activeAmbient,
    setActiveAmbient,
    audioRefs,
    ambientRefs,
    spotRefs
  } = useAudioContext();

  const playTrack = useCallback((envId: number, trackType: TrackType) => {
    const env = environments.find(e => e.id === envId);
    if (!env?.tracks[trackType]) return;
    
    // Stop all other tracks
    Object.keys(isPlaying).forEach(key => {
      const audioElement = audioRefs.current[`${currentPlayingEnv}_${key}`];
      if (audioElement) {
        audioElement.pause();
      }
    });
    
    const audioKey = `${envId}_${trackType}`;
    const audio = audioRefs.current[audioKey];
    
    if (audio) {
      if (isPlaying[trackType] && currentPlayingEnv === envId) {
        audio.pause();
        setIsPlaying(prev => ({ ...prev, [trackType]: false }));
        setCurrentPlayingEnv(null);
      } else {
        audio.volume = volumes.music;
        audio.loop = true;
        audio.play();
        setIsPlaying({
          combat: trackType === 'combat',
          exploration: trackType === 'exploration',
          sneak: trackType === 'sneak'
        });
        setCurrentPlayingEnv(envId);
      }
    }
  }, [environments, isPlaying, currentPlayingEnv, volumes.music, audioRefs, setIsPlaying, setCurrentPlayingEnv]);

  const toggleAmbient = useCallback((soundId: string) => {
    const isActive = activeAmbient.includes(soundId);
    
    if (isActive) {
      const audioElement = ambientRefs.current[soundId];
      if (audioElement) {
        audioElement.pause();
      }
      setActiveAmbient(prev => prev.filter(id => id !== soundId));
    } else {
      const audio = ambientRefs.current[soundId];
      if (audio) {
        audio.volume = volumes.ambient;
        audio.loop = true;
        audio.play();
      }
      setActiveAmbient(prev => [...prev, soundId]);
    }
  }, [activeAmbient, ambientRefs, volumes.ambient, setActiveAmbient]);

  const playSpot = useCallback((soundId: string) => {
    const audio = spotRefs.current[soundId];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volumes.spot;
      audio.play();
    }
  }, [spotRefs, volumes.spot]);

  const stopAll = useCallback(() => {
    // Stop all tracks
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) audio.pause();
    });
    
    // Stop all ambient
    Object.values(ambientRefs.current).forEach(audio => {
      if (audio) audio.pause();
    });
    
    setIsPlaying({ combat: false, exploration: false, sneak: false });
    setActiveAmbient([]);
    setCurrentPlayingEnv(null);
  }, [audioRefs, ambientRefs, setIsPlaying, setActiveAmbient, setCurrentPlayingEnv]);

  return {
    playTrack,
    toggleAmbient,
    playSpot,
    stopAll
  };
};