// Audio file loader utility to preload sounds from the sounds directory

import { AudioFile } from '../types/audio';

// Available ambient sound files
export const availableAmbientFiles: Record<string, string> = {
  rain: '/sounds/ambience/rain.m4a',
  wind: '/sounds/ambience/wind.mp3',
  fire: '/sounds/ambience/fire.m4a',
  forest: '/sounds/ambience/forest.mp3',
  city: '/sounds/ambience/city.mp3',
  waves: '/sounds/ambience/waves.mp3',
  war: '/sounds/ambience/war.mp3'
};

// Available sound effect files
export const availableEffectFiles: Record<string, string> = {
  wolf: '/sounds/effects/wolf.mp3',
  thunder: '/sounds/effects/thunder.mp3',
  roar: '/sounds/effects/roar.mp3',
  explosion: '/sounds/effects/explosion.mp3'
};

// Function to check if a file exists and load it
export const loadAudioFile = async (filePath: string): Promise<AudioFile | null> => {
  try {
    const response = await fetch(filePath, { method: 'HEAD' });
    if (response.ok) {
      return {
        url: filePath,
        name: filePath.split('/').pop() || 'Unknown'
      };
    }
  } catch (error) {
    console.warn(`Audio file not found: ${filePath}`);
  }
  return null;
};

// Load all available ambient sounds
export const loadAvailableAmbientSounds = async (): Promise<Record<string, AudioFile>> => {
  const loadedSounds: Record<string, AudioFile> = {};
  
  for (const [id, filePath] of Object.entries(availableAmbientFiles)) {
    const audioFile = await loadAudioFile(filePath);
    if (audioFile) {
      loadedSounds[id] = audioFile;
    }
  }
  
  return loadedSounds;
};

// Load all available sound effects
export const loadAvailableEffectSounds = async (): Promise<Record<string, AudioFile>> => {
  const loadedSounds: Record<string, AudioFile> = {};
  
  for (const [id, filePath] of Object.entries(availableEffectFiles)) {
    const audioFile = await loadAudioFile(filePath);
    if (audioFile) {
      loadedSounds[id] = audioFile;
    }
  }
  
  return loadedSounds;
};

// Function to get file extension from filename
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Function to check if file type is supported
export const isSupportedAudioFile = (filename: string): boolean => {
  const supportedExtensions = ['mp3', 'wav', 'm4a', 'mp3', 'ogg', 'mp4'];
  const extension = getFileExtension(filename);
  return supportedExtensions.includes(extension);
};