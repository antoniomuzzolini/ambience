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
      const response = await fetch('/api/tracks/list?type=music', {
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
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      
      <div className="relative">
        {/* Selected Track or Selector Button */}
        {selectedTrack ? (
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-blue-400" />
              <span className="text-white truncate">{selectedTrack.name}</span>
            </div>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-red-400 p-1"
              title="Remove track"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-left text-gray-400 hover:bg-gray-600 hover:border-gray-500 transition-colors"
          >
            {placeholder}
          </button>
        )}

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tracks..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Track List */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">
                  Loading tracks...
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  {tracks.length === 0 ? 'No music tracks uploaded yet' : 'No tracks match your search'}
                </div>
              ) : (
                filteredTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    className="w-full p-3 text-left hover:bg-gray-700 border-b border-gray-700 last:border-b-0 flex items-center gap-2 transition-colors"
                  >
                    <Music className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-white truncate">{track.name}</span>
                  </button>
                ))
              )}
            </div>

            {/* Close Button */}
            <div className="p-2 border-t border-gray-600">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};