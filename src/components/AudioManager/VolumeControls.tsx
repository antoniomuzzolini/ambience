import React from 'react';
import { useVolumeControl } from '../../hooks/useVolumeControl';
import { useAudioContext } from '../../context/AudioContext';
import { VolumeState } from '../../types/audio';

interface VolumeControlsProps {
  showSettings: boolean;
}

export const VolumeControls: React.FC<VolumeControlsProps> = ({ showSettings }) => {
  const { volumes, updateVolume, getVolumeLabel } = useVolumeControl();
  const { fadeSettings, setFadeSettings } = useAudioContext();

  if (!showSettings) return null;

  const handleFadeDurationChange = (duration: number) => {
    setFadeSettings(prev => ({ ...prev, duration }));
  };

  const handleFadeToggle = (enabled: boolean) => {
    setFadeSettings(prev => ({ ...prev, enabled }));
  };

  return (
    <div className="medieval-card p-6 mb-6 relative">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-6 h-6 border-l border-t border-medieval-gold/40"></div>
      <div className="absolute top-2 right-2 w-6 h-6 border-r border-t border-medieval-gold/40"></div>
      <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b border-medieval-gold/40"></div>
      <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b border-medieval-gold/40"></div>
      
      <h3 className="medieval-heading font-semibold mb-4 text-shadow-medieval">⚙️ Audio Settings</h3>
      
      {/* Volume Controls */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-medieval-gold medieval-text text-shadow-medieval">🔊 Volume Controls</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(Object.entries(volumes) as [keyof VolumeState, number][]).map(([type, value]) => (
            <div key={type} className="flex flex-col">
              <label className="text-sm mb-1 medieval-text text-medieval-parchment">{getVolumeLabel(type)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={value}
                onChange={(e) => updateVolume(type, parseFloat(e.target.value))}
                className="medieval-range w-full"
              />
              <span className="text-xs text-medieval-parchment/70 medieval-text">{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Medieval Divider */}
      <div className="medieval-divider"></div>

      {/* Fade Settings */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-medieval-gold medieval-text text-shadow-medieval">🌫️ Transition Enchantments</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Fade Duration */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 medieval-text text-medieval-parchment">Fade Duration</label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={fadeSettings.duration}
              onChange={(e) => handleFadeDurationChange(parseFloat(e.target.value))}
              className="medieval-range w-full"
            />
            <span className="text-xs text-medieval-parchment/70 medieval-text">{fadeSettings.duration}s</span>
          </div>

          {/* Fade Enable/Disable */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 medieval-text text-medieval-parchment">Fade Transitions</label>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fadeSettings.enabled}
                  onChange={(e) => handleFadeToggle(e.target.checked)}
                  className="w-4 h-4 accent-medieval-gold"
                />
                <span className="text-sm medieval-text text-medieval-parchment">Enable smooth fading</span>
              </label>
            </div>
            <span className="text-xs text-medieval-parchment/70 medieval-text mt-1">
              {fadeSettings.enabled ? 'Smooth transitions' : 'Instant changes'}
            </span>
          </div>
        </div>
      </div>

      {/* Medieval Tips */}
      <div className="mt-4 p-4 bg-medieval-brown/20 rounded border border-medieval-gold/30">
        <p className="text-xs text-medieval-parchment/90 medieval-text">
          🧙‍♂️ <strong className="text-medieval-gold">Master's Wisdom:</strong> Fade transitions create smooth audio changes when switching tracks or toggling ambient sounds. 
          Longer durations provide more gradual transitions between audio tracks.
        </p>
      </div>
    </div>
  );
};