// Type definitions for the D&D Audio Manager

export interface Track {
  id?: number;
  url: string;
  name: string;
}

export interface Environment {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  tracks: {
    combat: Track | null;
    exploration: Track | null;
    tension: Track | null;
  };
}

export interface AudioFile {
  url: string;
  name: string;
}

export interface PlayingState {
  combat: boolean;
  exploration: boolean;
  tension: boolean;
}

export interface TransitionalState {
  combat: 'idle' | 'starting' | 'playing' | 'stopping';
  exploration: 'idle' | 'starting' | 'playing' | 'stopping';
  tension: 'idle' | 'starting' | 'playing' | 'stopping';
}

export interface AmbientState {
  [soundId: string]: 'idle' | 'starting' | 'playing' | 'stopping';
}

export interface VolumeState {
  music: number;
  ambient: number;
  spot: number;
}

export interface FadeSettings {
  duration: number; // Fade duration in seconds
  enabled: boolean; // Whether fading is enabled
}

export interface PredefinedSound {
  id: string;
  name: string;
  icon: string;
}

export interface PredefinedSpot extends PredefinedSound {
  key: string;
}

// Type for track types
export type TrackType = keyof Environment['tracks'];

// Type for volume types
export type VolumeType = keyof VolumeState;

// Audio refs type
export type AudioRefs = Record<string, HTMLAudioElement | null>;