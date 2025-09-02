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
      
      const response = await fetch('/api/tracks', {
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
      title: 'Musical Scrolls',
      description: 'Epic compositions and bardic melodies',
      icon: Music,
      color: 'bg-medieval-burgundy',
      hoverColor: 'hover:bg-medieval-burgundy-dark',
      tracks: tracksByType.music,
    },
    {
      id: 'ambient',
      title: 'Realm Ambience',
      description: 'Atmospheric enchantments and mystical loops',
      icon: Volume2,
      color: 'bg-medieval-forest',
      hoverColor: 'hover:bg-medieval-forest-dark',
      tracks: tracksByType.ambient,
    },
    {
      id: 'effect',
      title: 'Arcane Effects',
      description: 'Magical incantations and spell sounds',
      icon: Zap,
      color: 'bg-medieval-gold',
      hoverColor: 'hover:bg-medieval-gold-dark',
      tracks: tracksByType.effect,
    },
  ];

  if (loading) {
    return (
      <div className="medieval-card p-6">
        <div className="text-center text-medieval-parchment/70 medieval-text">Loading scrolls from the archives...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Message Display */}
      {message && (
        <div className={`p-4 rounded-lg medieval-text ${
          message.type === 'success' 
            ? 'bg-medieval-forest/50 border border-medieval-gold text-medieval-parchment'
            : 'bg-medieval-burgundy/50 border border-medieval-burgundy text-medieval-parchment'
        }`}>
          {message.text}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-medieval-burgundy/50 border border-medieval-burgundy text-medieval-parchment p-4 rounded-lg medieval-text">
          {error}
        </div>
      )}

      {/* Track Sections */}
      {sections.map((section) => {
        const Icon = section.icon;
        const isUploading = uploadingSections.has(section.id);
        
        return (
          <div key={section.id} className="medieval-card overflow-hidden relative">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l border-t border-medieval-gold/40"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-r border-t border-medieval-gold/40"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b border-medieval-gold/40"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b border-medieval-gold/40"></div>
            
            {/* Section Header */}
            <div className="p-6 border-b border-medieval-gold/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${section.color} shadow-medieval-button`}>
                    <Icon className="h-5 w-5 text-medieval-parchment" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-medieval-gold medieval-heading text-shadow-medieval">
                      {section.title}
                    </h3>
                    <p className="text-medieval-parchment/70 text-sm medieval-text">
                      {section.description} • {section.tracks.length} scroll{section.tracks.length !== 1 ? 's' : ''}
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
                <div className="text-center py-8 text-medieval-parchment/70">
                  <Icon className="h-12 w-12 mx-auto mb-3 opacity-50 text-medieval-gold" />
                  <p className="text-lg font-medium mb-1 medieval-text text-medieval-gold">No {section.title.toLowerCase()} yet</p>
                  <p className="text-sm medieval-text">Upload thy first {section.title.toLowerCase().replace('scrolls', 'scroll').replace('effects', 'effect')} to begin</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};