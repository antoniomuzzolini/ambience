import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { 
  Environment, 
  PlayingState, 
  VolumeState, 
  AudioFile, 
  AudioRefs,
  PredefinedSound,
  PredefinedSpot 
} from '../types/audio';

// Predefined sounds data - matching actual files in /sounds directory
export const predefinedAmbient: PredefinedSound[] = [
  { id: 'rain', name: 'Rain', icon: '🌧️' },
  { id: 'wind', name: 'Wind', icon: '💨' },
  { id: 'fire', name: 'Fire', icon: '🔥' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
  { id: 'city', name: 'City', icon: '🏙️' },
  { id: 'waves', name: 'Ocean Waves', icon: '🌊' },
  { id: 'war', name: 'War Ambience', icon: '⚔️' }
];

export const predefinedSpots: PredefinedSpot[] = [
  { id: 'wolf', name: 'Wolf', key: '1', icon: '🐺' },
  { id: 'thunder', name: 'Thunder', key: '2', icon: '⛈️' },
  { id: 'roar', name: 'Roar', key: '3', icon: '🦁' },
  { id: 'explosion', name: 'Explosion', key: '4', icon: '💥' }
];

// Context type definition
interface AudioContextType {
  // State
  environments: Environment[];
  editingEnvironment: Environment | null;
  isPlaying: PlayingState;
  currentPlayingEnv: number | null;
  volumes: VolumeState;
  activeAmbient: string[];
  showSettings: boolean;
  showCreateForm: boolean;
  newEnvironmentName: string;
  globalAmbientSounds: Record<string, AudioFile>;
  globalSpotSounds: Record<string, AudioFile>;
  
  // State setters
  setEnvironments: React.Dispatch<React.SetStateAction<Environment[]>>;
  setEditingEnvironment: React.Dispatch<React.SetStateAction<Environment | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<PlayingState>>;
  setCurrentPlayingEnv: React.Dispatch<React.SetStateAction<number | null>>;
  setVolumes: React.Dispatch<React.SetStateAction<VolumeState>>;
  setActiveAmbient: React.Dispatch<React.SetStateAction<string[]>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreateForm: React.Dispatch<React.SetStateAction<boolean>>;
  setNewEnvironmentName: React.Dispatch<React.SetStateAction<string>>;
  setGlobalAmbientSounds: React.Dispatch<React.SetStateAction<Record<string, AudioFile>>>;
  setGlobalSpotSounds: React.Dispatch<React.SetStateAction<Record<string, AudioFile>>>;
  
  // Audio refs
  audioRefs: React.MutableRefObject<AudioRefs>;
  ambientRefs: React.MutableRefObject<AudioRefs>;
  spotRefs: React.MutableRefObject<AudioRefs>;
}

// Create context
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Provider component
export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [isPlaying, setIsPlaying] = useState<PlayingState>({
    combat: false,
    exploration: false,
    sneak: false
  });
  const [currentPlayingEnv, setCurrentPlayingEnv] = useState<number | null>(null);
  const [volumes, setVolumes] = useState<VolumeState>({
    music: 0.7,
    ambient: 0.5,
    spot: 0.8
  });
  const [activeAmbient, setActiveAmbient] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState<string>('');
  const [globalAmbientSounds, setGlobalAmbientSounds] = useState<Record<string, AudioFile>>({});
  const [globalSpotSounds, setGlobalSpotSounds] = useState<Record<string, AudioFile>>({});
  
  // Audio refs
  const audioRefs = useRef<AudioRefs>({});
  const ambientRefs = useRef<AudioRefs>({});
  const spotRefs = useRef<AudioRefs>({});

  const value: AudioContextType = {
    // State
    environments,
    editingEnvironment,
    isPlaying,
    currentPlayingEnv,
    volumes,
    activeAmbient,
    showSettings,
    showCreateForm,
    newEnvironmentName,
    globalAmbientSounds,
    globalSpotSounds,
    
    // State setters
    setEnvironments,
    setEditingEnvironment,
    setIsPlaying,
    setCurrentPlayingEnv,
    setVolumes,
    setActiveAmbient,
    setShowSettings,
    setShowCreateForm,
    setNewEnvironmentName,
    setGlobalAmbientSounds,
    setGlobalSpotSounds,
    
    // Audio refs
    audioRefs,
    ambientRefs,
    spotRefs
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// Custom hook to use the context
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};