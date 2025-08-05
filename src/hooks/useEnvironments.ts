import { useCallback, useState } from 'react';
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

  const [loading, setLoading] = useState(false);

  const fetchEnvironments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/environments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setEnvironments(result.environments);
      }
    } catch (error) {
      console.error('Error fetching environments:', error);
    } finally {
      setLoading(false);
    }
  }, [setEnvironments]);

  const createEnvironment = useCallback(async () => {
    if (!newEnvironmentName.trim()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/environments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newEnvironmentName.trim(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Ensure the environment has the proper tracks structure
        const newEnvironment = {
          ...result.environment,
          tracks: result.environment.tracks || {
            combat: null,
            exploration: null,
            sneak: null
          }
        };
        setEnvironments(prev => [...prev, newEnvironment]);
        setNewEnvironmentName('');
        setShowCreateForm(false);
      } else {
        console.error('Failed to create environment:', result.message);
      }
    } catch (error) {
      console.error('Error creating environment:', error);
    }
  }, [newEnvironmentName, setEnvironments, setNewEnvironmentName, setShowCreateForm]);

  const deleteEnvironment = useCallback(async (envId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/environments?id=${envId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setEnvironments(prev => prev.filter(env => env.id !== envId));
      } else {
        console.error('Failed to delete environment:', result.message);
      }
    } catch (error) {
      console.error('Error deleting environment:', error);
    }
  }, [setEnvironments]);

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
    deleteEnvironment,
    fetchEnvironments,
    loading,
    handleFileUpload,
    handleGlobalAmbientUpload,
    handleGlobalSpotUpload,
    getTrackIcon,
    getTrackName
  };
};