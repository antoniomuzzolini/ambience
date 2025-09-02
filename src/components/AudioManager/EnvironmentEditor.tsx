import React, { useState } from 'react';
import { Music, Save, Link as LinkIcon, ArrowLeft, Crown } from 'lucide-react';
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
    combat: editingEnvironment?.tracks?.combat || null,
    exploration: editingEnvironment?.tracks?.exploration || null,
    tension: editingEnvironment?.tracks?.tension || null,
  });

  if (!editingEnvironment) return null;

  const handleTrackChange = (trackType: 'combat' | 'exploration' | 'tension', track: { id: number; name: string; url: string } | null) => {
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
      const response = await fetch(`/api/environments?id=${editingEnvironment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingEnvironment.name,
          combatTrackId: tracks.combat?.id || null,
          explorationTrackId: tracks.exploration?.id || null,
          tensionTrackId: tracks.tension?.id || null,
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
    <div className="min-h-screen medieval-text text-medieval-parchment p-4">
      <div className="max-w-4xl mx-auto">
        {/* Medieval Header */}
        <div className="medieval-card p-6 mb-6 relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-medieval-gold opacity-50"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-medieval-gold opacity-50"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-medieval-gold opacity-50"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-medieval-gold opacity-50"></div>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditingEnvironment(null)}
                className="medieval-btn px-4 py-2 rounded flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Return to Hall
              </button>
              <h1 className="medieval-heading text-2xl font-bold text-shadow-medieval-strong">
                <Crown size={24} className="inline mr-2" />
                Sanctum: {editingEnvironment.name}
              </h1>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="medieval-btn medieval-btn-primary px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-medieval-brown-dark border-t-transparent"></div>
                  Enchanting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Sanctum
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg medieval-text ${
            message.type === 'success' 
              ? 'bg-medieval-forest/50 border border-medieval-gold text-medieval-parchment'
              : 'bg-medieval-burgundy/50 border border-medieval-burgundy text-medieval-parchment'
          }`}>
            {message.text}
          </div>
        )}

        {/* Medieval Instructions */}
        <div className="medieval-card p-6 mb-6 relative">
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l border-t border-medieval-gold/40"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-r border-t border-medieval-gold/40"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b border-medieval-gold/40"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b border-medieval-gold/40"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4 text-medieval-gold" />
            <span className="text-medieval-gold font-medium medieval-text">Bind Thy Musical Scrolls</span>
          </div>
          <p className="text-medieval-parchment/90 text-sm medieval-text">
            Choose from thy uploaded musical scrolls for each battle scenario. 
            Thou may upload new scrolls in the "Royal Arsenal" section.
          </p>
        </div>

        {/* Medieval Music Tracks */}
        <div className="medieval-card p-6 relative">
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l border-t border-medieval-gold/40"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-r border-t border-medieval-gold/40"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b border-medieval-gold/40"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b border-medieval-gold/40"></div>
          
          <h2 className="medieval-heading text-xl font-semibold mb-6 flex items-center gap-2 text-shadow-medieval">
            <Music size={20} />
            Musical Scrolls
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {(['combat', 'exploration', 'tension'] as const).map(trackType => (
              <div key={trackType} className="bg-medieval-brown/40 border border-medieval-gold/30 p-4 rounded-lg">
                <h3 className="font-medium mb-4 text-center flex items-center justify-center gap-2 medieval-text text-medieval-gold text-shadow-medieval">
                  {getTrackIcon(trackType)}
                  {getTrackName(trackType)}
                </h3>
                
                <TrackSelector
                  selectedTrack={tracks[trackType]}
                  onTrackSelect={(track) => handleTrackChange(trackType, track)}
                  label={`${getTrackName(trackType)} Scroll`}
                  placeholder={`Choose ${getTrackName(trackType).toLowerCase()} melody...`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};