import React from 'react';
import { Music } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { useEnvironments } from '../../hooks/useEnvironments';
import { FileUpload } from '../ui/FileUpload';

export const EnvironmentEditor: React.FC = () => {
  const { editingEnvironment, setEditingEnvironment } = useAudioContext();
  const { handleFileUpload, getTrackIcon, getTrackName } = useEnvironments();

  if (!editingEnvironment) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditingEnvironment(null)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">🎵 Manage: {editingEnvironment.name}</h1>
          </div>
        </div>

        {/* Music Tracks */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Music size={20} />
            Music Tracks
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {(['combat', 'exploration', 'sneak'] as const).map(trackType => (
              <div key={trackType} className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-4 text-center flex items-center justify-center gap-2">
                  {getTrackIcon(trackType)}
                  {getTrackName(trackType)}
                </h3>
                
                <FileUpload
                  onFileSelect={(file) => handleFileUpload(editingEnvironment.id, trackType, file)}
                  currentFile={editingEnvironment.tracks[trackType]}
                  label={`Click to upload<br/>${getTrackName(trackType).toLowerCase()} track`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};