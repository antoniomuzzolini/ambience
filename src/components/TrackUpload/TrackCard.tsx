import React, { useState } from 'react';
import { Play, Pause, Trash2, Download, Music, Volume2, Zap } from 'lucide-react';
import { UploadedTrack } from '../../types/tracks';

interface TrackCardProps {
  track: UploadedTrack;
  onDeleteSuccess: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onDeleteSuccess }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const getTypeIcon = () => {
    switch (track.type) {
      case 'music': return <Music className="h-4 w-4" />;
      case 'ambient': return <Volume2 className="h-4 w-4" />;
      case 'effect': return <Zap className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (track.type) {
      case 'music': return 'text-purple-400';
      case 'ambient': return 'text-blue-400';
      case 'effect': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const togglePlay = () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio) {
        audio.play();
      } else {
        const newAudio = new Audio(track.url);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        newAudio.addEventListener('error', () => setIsPlaying(false));
        newAudio.play();
        setAudio(newAudio);
      }
      setIsPlaying(true);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/tracks?id=${track.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        onDeleteSuccess();
      } else {
        alert('Failed to delete track: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete track');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = track.url;
    link.download = track.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={getTypeColor()}>
            {getTypeIcon()}
          </div>
          <h4 className="text-white font-medium truncate" title={track.name}>
            {track.name}
          </h4>
        </div>
      </div>

      {/* File Info */}
      <div className="text-xs text-gray-400 mb-3 space-y-1">
        <div>Size: {formatFileSize(track.file_size)}</div>
        <div>Uploaded: {formatDate(track.created_at)}</div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={handleDownload}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:cursor-not-allowed"
          title="Delete"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};