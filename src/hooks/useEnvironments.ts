import { useCallback } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { Environment, TrackType } from '../types/audio';

export const useEnvironments = () => {
  const {
    environments,
    setEnvironments,
    newEnvironmentName,
    setNewEnvironmentName,
    showCreateForm,
    setShowCreateForm,
    setEditingEnvironment,
    globalAmbientSounds,
    setGlobalAmbientSounds,
    globalSpotSounds,
    setGlobalSpotSounds
  } = useAudioContext();

  const createEnvironment = useCallback(() => {
    if (newEnvironmentName.trim()) {
      const newEnv: Environment = {
        id: Date.now(),
        name: newEnvironmentName.trim(),
        tracks: {
          combat: null,
          exploration: null,
          sneak: null
        }
      };
      setEnvironments(prev => [...prev, newEnv]);
      setNewEnvironmentName('');
      setShowCreateForm(false);
    }
  }, [newEnvironmentName, setEnvironments, setNewEnvironmentName, setShowCreateForm]);

  const handleFileUpload = useCallback((envId: number, trackType: TrackType, file: File | null) => {
    if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
      const url = URL.createObjectURL(file);
      setEnvironments(envs => 
        envs.map(env => 
          env.id === envId 
            ? { 
                ...env, 
                tracks: { 
                  ...env.tracks, 
                  [trackType]: { url, name: file.name } 
                } 
              }
            : env
        )
      );
    }
  }, [setEnvironments]);

  const handleGlobalAmbientUpload = useCallback((soundId: string, file: File | null) => {
    if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
      const url = URL.createObjectURL(file);
      setGlobalAmbientSounds(prev => ({
        ...prev,
        [soundId]: { url, name: file.name }
      }));
    }
  }, [setGlobalAmbientSounds]);

  const handleGlobalSpotUpload = useCallback((soundId: string, file: File | null) => {
    if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
      const url = URL.createObjectURL(file);
      setGlobalSpotSounds(prev => ({
        ...prev,
        [soundId]: { url, name: file.name }
      }));
    }
  }, [setGlobalSpotSounds]);

  const getTrackIcon = useCallback((trackType: string) => {
    switch(trackType) {
      case 'combat': return '⚔️';
      case 'exploration': return '🗺️';
      case 'sneak': return '🥷';
      default: return '🎵';
    }
  }, []);

  const getTrackName = useCallback((trackType: string) => {
    switch(trackType) {
      case 'combat': return 'Combat';
      case 'exploration': return 'Exploration';
      case 'sneak': return 'Stealth';
      default: return trackType;
    }
  }, []);

  return {
    environments,
    newEnvironmentName,
    setNewEnvironmentName,
    showCreateForm,
    setShowCreateForm,
    setEditingEnvironment,
    globalAmbientSounds,
    globalSpotSounds,
    createEnvironment,
    handleFileUpload,
    handleGlobalAmbientUpload,
    handleGlobalSpotUpload,
    getTrackIcon,
    getTrackName
  };
};