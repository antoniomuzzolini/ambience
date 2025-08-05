import React, { useState } from 'react';
import { Music, Upload, List } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { UserTracks } from './UserTracks';

export const TrackManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'tracks'>('upload');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUploadSuccess = (track: any) => {
    setMessage({ type: 'success', text: `"${track.name}" uploaded successfully!` });
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('tracks'); // Switch to tracks view
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUploadError = (error: string) => {
    setMessage({ type: 'error', text: error });
    
    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="h-6 w-6" />
            Track Manager
          </h2>
          
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
            <button
              onClick={() => setActiveTab('tracks')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'tracks'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
              My Tracks
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.type === 'success' 
              ? 'bg-green-900/50 border border-green-500 text-green-200'
              : 'bg-red-900/50 border border-red-500 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="text-gray-300">
          <p className="mb-2">
            Upload and manage your custom audio tracks for your ambience sessions.
          </p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• <strong>Ambient:</strong> Background loops and atmospheric sounds</li>
            <li>• <strong>Effects:</strong> One-shot sounds and sound effects</li>
            <li>• <strong>Music:</strong> Background music and musical tracks</li>
          </ul>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'upload' ? (
        <FileUpload 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      ) : (
        <UserTracks refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
};