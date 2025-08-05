import React, { useState, useEffect } from 'react';
import { Music, Play, Trash2, Download, Volume2, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UploadedTrack } from '../../types/tracks';

interface UserTracksProps {
  refreshTrigger?: number;
}

export const UserTracks: React.FC<UserTracksProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<UploadedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'ambient' | 'effect' | 'music'>('all');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const fetchTracks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const queryParam = filter !== 'all' ? `?type=${filter}` : '';
      
      const response = await fetch(`/api/tracks/list${queryParam}`, {
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
  }, [user, filter, refreshTrigger]);

  const playTrack = (track: UploadedTrack) => {
    if (playingTrack === track.id) {
      // Stop current track
      audioElement?.pause();
      setPlayingTrack(null);
      setAudioElement(null);
    } else {
      // Stop previous track
      audioElement?.pause();
      
      // Play new track
      const audio = new Audio(track.url);
      audio.play();
      setPlayingTrack(track.id);
      setAudioElement(audio);
      
      audio.onended = () => {
        setPlayingTrack(null);
        setAudioElement(null);
      };
    }
  };

  const deleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setTracks(prev => prev.filter(t => t.id !== trackId));
      } else {
        setError(result.message || 'Failed to delete track');
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      setError('Failed to delete track');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ambient': return <Volume2 className="h-4 w-4 text-blue-400" />;
      case 'effect': return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'music': return <Music className="h-4 w-4 text-purple-400" />;
      default: return <Volume2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <p className="text-gray-400">Please log in to view your tracks.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Music className="h-5 w-5" />
          Your Tracks ({tracks.length})
        </h3>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-1"
        >
          <option value="all">All Types</option>
          <option value="ambient">Ambient</option>
          <option value="effect">Effects</option>
          <option value="music">Music</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading tracks...</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-8">
          <Music className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tracks uploaded yet.</p>
          <p className="text-gray-500 text-sm">Upload some audio files to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <div key={track.id} className="bg-gray-700 p-4 rounded-lg flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getTypeIcon(track.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{track.name}</h4>
                  <p className="text-gray-400 text-sm">
                    {track.type} • {formatFileSize(track.fileSize)} • {formatDuration(track.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => playTrack(track)}
                  className={`p-2 rounded ${
                    playingTrack === track.id
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors`}
                  title={playingTrack === track.id ? 'Stop' : 'Play'}
                >
                  <Play className="h-4 w-4" />
                </button>

                <a
                  href={track.url}
                  download={track.filename}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>

                <button
                  onClick={() => deleteTrack(track.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};