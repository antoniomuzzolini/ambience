import React, { useState, useEffect } from 'react';
import { Music, Volume2, Zap, Upload, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UploadedTrack } from '../../types/tracks';
import { TrackCard } from './TrackCard';
import { SectionUpload } from './SectionUpload';

export const SectionedTrackView: React.FC = () => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<UploadedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [uploadingSections, setUploadingSections] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTracks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/tracks/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setTracks(result.tracks);
        setError('');
      } else {
        setError(result.message || 'Failed to load tracks');
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setError('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [user]);

  const handleUploadSuccess = (track: UploadedTrack) => {
    setMessage({ type: 'success', text: `"${track.name}" uploaded successfully!` });
    fetchTracks(); // Refresh tracks
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUploadError = (error: string) => {
    setMessage({ type: 'error', text: error });
    
    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeleteSuccess = () => {
    fetchTracks(); // Refresh tracks after deletion
  };

  // Group tracks by type
  const tracksByType = {
    music: tracks.filter(track => track.type === 'music'),
    ambient: tracks.filter(track => track.type === 'ambient'),
    effect: tracks.filter(track => track.type === 'effect'),
  };

  const sections = [
    {
      id: 'music',
      title: 'Music',
      description: 'Background music and musical tracks',
      icon: Music,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      tracks: tracksByType.music,
    },
    {
      id: 'ambient',
      title: 'Ambient',
      description: 'Background loops and atmospheric sounds',
      icon: Volume2,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      tracks: tracksByType.ambient,
    },
    {
      id: 'effect',
      title: 'Sound Effects',
      description: 'One-shot sounds and sound effects',
      icon: Zap,
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      tracks: tracksByType.effect,
    },
  ];

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="text-center text-gray-400">Loading tracks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/50 border border-green-500 text-green-200'
            : 'bg-red-900/50 border border-red-500 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Track Sections */}
      {sections.map((section) => {
        const Icon = section.icon;
        const isUploading = uploadingSections.has(section.id);
        
        return (
          <div key={section.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Section Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${section.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {section.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {section.description} • {section.tracks.length} track{section.tracks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <SectionUpload
                  trackType={section.id as 'music' | 'ambient' | 'effect'}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  color={section.color}
                  hoverColor={section.hoverColor}
                />
              </div>
            </div>

            {/* Tracks Grid */}
            <div className="p-6">
              {section.tracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.tracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      onDeleteSuccess={handleDeleteSuccess}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">No {section.title.toLowerCase()} tracks yet</p>
                  <p className="text-sm">Upload your first {section.title.toLowerCase()} track to get started</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};