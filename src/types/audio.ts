// Type definitions for the D&D Audio Manager

export interface Track {
  url: string;
  name: string;
}

export interface Environment {
  id: number;
  name: string;
  tracks: {
    combat: Track | null;
    exploration: Track | null;
    sneak: Track | null;
  };
}

export interface AudioFile {
  url: string;
  name: string;
}

export interface PlayingState {
  combat: boolean;
  exploration: boolean;
  sneak: boolean;
}

export interface VolumeState {
  music: number;
  ambient: number;
  spot: number;
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