import React, { useState, useEffect } from 'react';
import { Music, Search, X } from 'lucide-react';
import { UploadedTrack } from '../../types/tracks';

interface TrackSelectorProps {
  selectedTrack: { id: number; name: string; url: string } | null;
  onTrackSelect: (track: { id: number; name: string; url: string } | null) => void;
  label: string;
  placeholder?: string;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  selectedTrack,
  onTrackSelect,
  label,
  placeholder = "Select a track..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tracks, setTracks] = useState<UploadedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMusicTracks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/tracks?type=music', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setTracks(result.tracks);
      }
    } catch (error) {
      console.error('Error fetching music tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && tracks.length === 0) {
      fetchMusicTracks();
    }
  }, [isOpen]);

  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTrackSelect = (track: UploadedTrack) => {
    onTrackSelect({
      id: track.id,
      name: track.name,
      url: track.url
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    onTrackSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-medieval-parchment/90 medieval-text">
        {label}
      </label>
      
      <div className="relative">
        {/* Selected Track or Selector Button */}
        {selectedTrack ? (
          <div className="bg-medieval-brown/40 border border-medieval-gold/30 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-medieval-gold" />
              <span className="text-medieval-parchment truncate medieval-text">{selectedTrack.name}</span>
            </div>
            <button
              onClick={clearSelection}
              className="text-medieval-parchment/60 hover:text-medieval-burgundy p-1 transition-colors"
              title="Remove scroll"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-medieval-brown/40 border border-medieval-brown rounded-lg p-3 text-left text-medieval-parchment/60 hover:bg-medieval-brown/60 hover:border-medieval-gold/50 transition-colors medieval-text"
          >
            {placeholder}
          </button>
        )}

        {/* Medieval Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-medieval-card border-2 border-medieval-gold rounded-lg shadow-medieval z-50 max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-medieval-gold/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medieval-parchment/60" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search scrolls..."
                  className="medieval-input w-full pl-10 pr-4 py-2"
                  autoFocus
                />
              </div>
            </div>

            {/* Track List */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-medieval-parchment/70 medieval-text">
                  Loading scrolls...
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="p-4 text-center text-medieval-parchment/70 medieval-text">
                  {tracks.length === 0 ? 'No musical scrolls in thy collection yet' : 'No scrolls match thy search'}
                </div>
              ) : (
                filteredTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    className="w-full p-3 text-left hover:bg-medieval-brown/20 border-b border-medieval-gold/20 last:border-b-0 flex items-center gap-2 transition-colors"
                  >
                    <Music className="h-4 w-4 text-medieval-gold flex-shrink-0" />
                    <span className="text-medieval-parchment truncate medieval-text">{track.name}</span>
                  </button>
                ))
              )}
            </div>

            {/* Close Button */}
            <div className="p-2 border-t border-medieval-gold/30">
              <button
                onClick={() => setIsOpen(false)}
                className="medieval-btn w-full px-3 py-2 text-sm"
              >
                Close Tome
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};