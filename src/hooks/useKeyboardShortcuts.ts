import { useEffect } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { predefinedSpots } from '../context/AudioContext';
import { useAudioManager } from './useAudioManager';

export const useKeyboardShortcuts = () => {
  const { globalSpotSounds } = useAudioContext();
  const { playSpot } = useAudioManager();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      const spot = predefinedSpots.find(s => s.key === e.key);
      if (spot && globalSpotSounds[spot.id]) {
        playSpot(spot.id);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [globalSpotSounds, playSpot]);
};