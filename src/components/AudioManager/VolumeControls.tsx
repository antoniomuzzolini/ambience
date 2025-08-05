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
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h3 className="font-semibold mb-4">Audio Controls</h3>
      
      {/* Volume Controls */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-blue-400">Volume Levels</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(Object.entries(volumes) as [keyof VolumeState, number][]).map(([type, value]) => (
            <div key={type} className="flex flex-col">
              <label className="text-sm mb-1">{getVolumeLabel(type)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={value}
                onChange={(e) => updateVolume(type, parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fade Settings */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-purple-400">Fade Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Fade Duration */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Fade Duration</label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={fadeSettings.duration}
              onChange={(e) => handleFadeDurationChange(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{fadeSettings.duration}s</span>
          </div>

          {/* Fade Enable/Disable */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Fade Transitions</label>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fadeSettings.enabled}
                  onChange={(e) => handleFadeToggle(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Enable smooth fading</span>
              </label>
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {fadeSettings.enabled ? 'Smooth transitions' : 'Instant changes'}
            </span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-gray-700 rounded">
        <p className="text-xs text-gray-400">
          💡 <strong>Fade transitions</strong> create smooth audio changes when switching tracks or toggling ambient sounds. 
          Longer durations provide more gradual transitions.
        </p>
      </div>
    </div>
  );
};