import React, { useState } from 'react';
import { Music, Save, Link as LinkIcon } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { useEnvironments } from '../../hooks/useEnvironments';
import { TrackSelector } from '../TrackUpload/TrackSelector';

export const EnvironmentEditor: React.FC = () => {
  const { editingEnvironment, setEditingEnvironment } = useAudioContext();
  const { getTrackIcon, getTrackName } = useEnvironments();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local state for tracks
  const [tracks, setTracks] = useState({
    combat: editingEnvironment?.tracks.combat || null,
    exploration: editingEnvironment?.tracks.exploration || null,
    sneak: editingEnvironment?.tracks.sneak || null,
  });

  if (!editingEnvironment) return null;

  const handleTrackChange = (trackType: 'combat' | 'exploration' | 'sneak', track: { id: number; name: string; url: string } | null) => {
    setTracks(prev => ({
      ...prev,
      [trackType]: track
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/environments/${editingEnvironment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingEnvironment.name,
          combatTrackId: tracks.combat?.id || null,
          explorationTrackId: tracks.exploration?.id || null,
          sneakTrackId: tracks.sneak?.id || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Environment saved successfully!' });
        // Update the environment in context with new tracks
        // This would require updating the useEnvironments hook to refresh from database
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save environment' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save environment' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

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
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/50 border border-green-500 text-green-200'
              : 'bg-red-900/50 border border-red-500 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 font-medium">Link Your Music Tracks</span>
          </div>
          <p className="text-blue-200 text-sm">
            Select from your uploaded music tracks for each situation. 
            You can upload new music tracks in the "My Tracks" section.
          </p>
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
                
                <TrackSelector
                  selectedTrack={tracks[trackType]}
                  onTrackSelect={(track) => handleTrackChange(trackType, track)}
                  label={`${getTrackName(trackType)} Track`}
                  placeholder={`Select ${getTrackName(trackType).toLowerCase()} music...`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};