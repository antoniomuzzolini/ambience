import { useCallback } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { TrackType } from '../types/audio';
import { fadeIn, fadeOut, crossFade } from '../utils/audioFade';

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
    fadeSettings,
    audioRefs,
    ambientRefs,
    spotRefs
  } = useAudioContext();

  const playTrack = useCallback(async (envId: number, trackType: TrackType) => {
    const env = environments.find(e => e.id === envId);
    if (!env?.tracks[trackType]) return;
    
    const audioKey = `${envId}_${trackType}`;
    const newAudio = audioRefs.current[audioKey];
    
    if (!newAudio) return;
    
    if (isPlaying[trackType] && currentPlayingEnv === envId) {
      // Stop current track with fade
      if (fadeSettings.enabled) {
        await fadeOut(newAudio, fadeSettings.duration);
      } else {
        newAudio.pause();
      }
      setIsPlaying(prev => ({ ...prev, [trackType]: false }));
      setCurrentPlayingEnv(null);
      return;
    }
    
    // Find currently playing track of the same type
    const currentAudioKey = `${currentPlayingEnv}_${trackType}`;
    const currentAudio = audioRefs.current[currentAudioKey];
    
    if (currentAudio && isPlaying[trackType]) {
      // Cross-fade between tracks
      if (fadeSettings.enabled) {
        newAudio.loop = true;
        newAudio.play();
        await crossFade(currentAudio, newAudio, volumes.music, fadeSettings.duration);
      } else {
        currentAudio.pause();
        newAudio.volume = volumes.music;
        newAudio.loop = true;
        newAudio.play();
      }
    } else {
      // Start new track with fade in
      newAudio.loop = true;
      newAudio.play();
      if (fadeSettings.enabled) {
        await fadeIn(newAudio, volumes.music, fadeSettings.duration);
      } else {
        newAudio.volume = volumes.music;
      }
    }
    
    setIsPlaying({
      combat: trackType === 'combat',
      exploration: trackType === 'exploration',
      sneak: trackType === 'sneak'
    });
    setCurrentPlayingEnv(envId);
  }, [environments, isPlaying, currentPlayingEnv, volumes.music, fadeSettings, audioRefs, setIsPlaying, setCurrentPlayingEnv]);

  const toggleAmbient = useCallback(async (soundId: string) => {
    const isActive = activeAmbient.includes(soundId);
    const audioElement = ambientRefs.current[soundId];
    
    if (!audioElement) return;
    
    if (isActive) {
      // Fade out and stop
      if (fadeSettings.enabled) {
        await fadeOut(audioElement, fadeSettings.duration);
      } else {
        audioElement.pause();
      }
      setActiveAmbient(prev => prev.filter(id => id !== soundId));
    } else {
      // Start and fade in
      audioElement.loop = true;
      audioElement.play();
      if (fadeSettings.enabled) {
        await fadeIn(audioElement, volumes.ambient, fadeSettings.duration);
      } else {
        audioElement.volume = volumes.ambient;
      }
      setActiveAmbient(prev => [...prev, soundId]);
    }
  }, [activeAmbient, ambientRefs, volumes.ambient, fadeSettings, setActiveAmbient]);

  const playSpot = useCallback((soundId: string) => {
    const audio = spotRefs.current[soundId];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volumes.spot;
      audio.play();
    }
  }, [spotRefs, volumes.spot]);

  const stopAll = useCallback(async () => {
    if (fadeSettings.enabled) {
      // Fade out all tracks
      const fadePromises: Promise<void>[] = [];
      
      Object.values(audioRefs.current).forEach(audio => {
        if (audio && !audio.paused) {
          fadePromises.push(fadeOut(audio, fadeSettings.duration));
        }
      });
      
      Object.values(ambientRefs.current).forEach(audio => {
        if (audio && !audio.paused) {
          fadePromises.push(fadeOut(audio, fadeSettings.duration));
        }
      });
      
      await Promise.all(fadePromises);
    } else {
      // Stop immediately
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) audio.pause();
      });
      
      Object.values(ambientRefs.current).forEach(audio => {
        if (audio) audio.pause();
      });
    }
    
    setIsPlaying({ combat: false, exploration: false, sneak: false });
    setActiveAmbient([]);
    setCurrentPlayingEnv(null);
  }, [audioRefs, ambientRefs, fadeSettings, setIsPlaying, setActiveAmbient, setCurrentPlayingEnv]);

  return {
    playTrack,
    toggleAmbient,
    playSpot,
    stopAll
  };
};