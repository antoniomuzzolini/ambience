import { useCallback, useRef } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { TrackType } from '../types/audio';
import { SeamlessLooper } from '../utils/audioFade';
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

  // Store seamless loopers for ambient sounds
  const seamlessLoopers = useRef<Record<string, SeamlessLooper>>({});

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
      tension: trackType === 'tension'
    });
    setCurrentPlayingEnv(envId);
  }, [environments, isPlaying, currentPlayingEnv, volumes.music, fadeSettings, audioRefs, setIsPlaying, setCurrentPlayingEnv]);

  const toggleAmbient = useCallback(async (soundId: string) => {
    const isActive = activeAmbient.includes(soundId);
    const audioElement = ambientRefs.current[soundId];
    
    if (!audioElement) return;
    
    if (isActive) {
      // Stop seamless looper if it exists
      const looper = seamlessLoopers.current[soundId];
      if (looper) {
        await looper.stop();
        delete seamlessLoopers.current[soundId];
      } else {
        // Fallback to regular audio element
        if (fadeSettings.enabled) {
          await fadeOut(audioElement, fadeSettings.duration);
        } else {
          audioElement.pause();
        }
      }
      setActiveAmbient(prev => prev.filter(id => id !== soundId));
    } else {
      // Check if we should use seamless looping
      const shouldUseSeamlessLoop = await checkShouldUseSeamlessLoop(audioElement);
      
      if (shouldUseSeamlessLoop) {
        // Create and start seamless looper
        const looper = new SeamlessLooper(audioElement.src, volumes.ambient);
        seamlessLoopers.current[soundId] = looper;
        await looper.start();
      } else {
        // Use regular looping for short tracks
        audioElement.loop = true;
        audioElement.play();
        if (fadeSettings.enabled) {
          await fadeIn(audioElement, volumes.ambient, fadeSettings.duration);
        } else {
          audioElement.volume = volumes.ambient;
        }
      }
      setActiveAmbient(prev => [...prev, soundId]);
    }
  }, [activeAmbient, ambientRefs, volumes.ambient, fadeSettings, setActiveAmbient]);

  // Check if audio should use seamless looping (for tracks > 5 seconds)
  const checkShouldUseSeamlessLoop = (audioElement: HTMLAudioElement): Promise<boolean> => {
    return new Promise((resolve) => {
      const checkDuration = () => {
        if (audioElement.duration && !isNaN(audioElement.duration)) {
          resolve(audioElement.duration > 5);
        } else if (audioElement.readyState >= 1) {
          // If we can't get duration but audio is loaded, assume it's short
          resolve(false);
        } else {
          // Wait a bit more for metadata to load
          setTimeout(checkDuration, 100);
        }
      };
      
      if (audioElement.readyState >= 1) {
        checkDuration();
      } else {
        audioElement.addEventListener('loadedmetadata', checkDuration, { once: true });
        audioElement.addEventListener('canplay', checkDuration, { once: true });
        // Fallback timeout
        setTimeout(() => resolve(false), 2000);
      }
    });
  };

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
    
    setIsPlaying({ combat: false, exploration: false, tension: false });
    setActiveAmbient([]);
    setCurrentPlayingEnv(null);
  }, [audioRefs, ambientRefs, fadeSettings, setIsPlaying, setActiveAmbient, setCurrentPlayingEnv]);

  // Update volume for seamless loopers when volume changes
  const updateSeamlessLooperVolumes = useCallback(async (newVolume: number) => {
    const updatePromises = Object.values(seamlessLoopers.current).map(looper => 
      looper.setVolume(newVolume)
    );
    await Promise.all(updatePromises);
  }, []);

  return {
    playTrack,
    toggleAmbient,
    playSpot,
    stopAll,
    updateSeamlessLooperVolumes
  };
};