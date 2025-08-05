import React from 'react';
import { useVolumeControl } from '../../hooks/useVolumeControl';
import { VolumeState } from '../../types/audio';

interface VolumeControlsProps {
  showSettings: boolean;
}

export const VolumeControls: React.FC<VolumeControlsProps> = ({ showSettings }) => {
  const { volumes, updateVolume, getVolumeLabel } = useVolumeControl();

  if (!showSettings) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h3 className="font-semibold mb-4">Volume Controls</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
  );
};