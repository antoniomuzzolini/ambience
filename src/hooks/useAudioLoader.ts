import { useEffect } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { loadAvailableAmbientSounds, loadAvailableEffectSounds } from '../utils/audioLoader';

export const useAudioLoader = () => {
  const { setGlobalAmbientSounds, setGlobalSpotSounds } = useAudioContext();

  useEffect(() => {
    const loadSounds = async () => {
      try {
        // Load ambient sounds
        const ambientSounds = await loadAvailableAmbientSounds();
        setGlobalAmbientSounds(ambientSounds);

        // Load effect sounds
        const effectSounds = await loadAvailableEffectSounds();
        setGlobalSpotSounds(effectSounds);

        console.log('✅ Audio files loaded successfully');
        console.log('🌧️ Ambient sounds:', Object.keys(ambientSounds));
        console.log('⚡ Effect sounds:', Object.keys(effectSounds));
      } catch (error) {
        console.error('❌ Error loading audio files:', error);
      }
    };

    loadSounds();
  }, [setGlobalAmbientSounds, setGlobalSpotSounds]);
};