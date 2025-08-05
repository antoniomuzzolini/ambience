import React from 'react';
import { Music, Plus, Edit, Play, Pause } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { useEnvironments } from '../../hooks/useEnvironments';
import { useAudioManager } from '../../hooks/useAudioManager';

export const EnvironmentsList: React.FC = () => {
  const { 
    environments, 
    showCreateForm, 
    setShowCreateForm, 
    newEnvironmentName, 
    setNewEnvironmentName,
    isPlaying,
    currentPlayingEnv,
    audioRefs
  } = useAudioContext();
  
  const { 
    createEnvironment, 
    setEditingEnvironment, 
    getTrackIcon 
  } = useEnvironments();
  
  const { playTrack } = useAudioManager();

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Music size={20} />
          Environments
        </h2>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700 p-2 rounded"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <input
            type="text"
            value={newEnvironmentName}
            onChange={(e) => setNewEnvironmentName(e.target.value)}
            placeholder="Environment name"
            className="w-full p-2 bg-gray-600 rounded mb-3 text-white placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && createEnvironment()}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={createEnvironment}
              disabled={!newEnvironmentName.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded text-sm"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewEnvironmentName('');
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {environments.map(env => (
          <div key={env.id} className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{env.name}</h3>
              <button
                onClick={() => setEditingEnvironment(env)}
                className="bg-gray-600 hover:bg-gray-500 p-1 rounded"
              >
                <Edit size={14} />
              </button>
            </div>
            
            {/* Quick Music Controls */}
            <div className="grid grid-cols-3 gap-1">
              {(['combat', 'exploration', 'sneak'] as const).map(trackType => (
                <button
                  key={trackType}
                  onClick={() => playTrack(env.id, trackType)}
                  disabled={!env.tracks[trackType]}
                  className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${
                    !env.tracks[trackType] 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : (isPlaying[trackType] && currentPlayingEnv === env.id)
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <span>{getTrackIcon(trackType)}</span>
                  {isPlaying[trackType] && currentPlayingEnv === env.id ? (
                    <Pause size={12} />
                  ) : (
                    <Play size={12} />
                  )}
                </button>
              ))}
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              Tracks: {Object.values(env.tracks).filter(Boolean).length}/3
            </p>

            {/* Hidden audio elements */}
            {Object.entries(env.tracks).map(([trackType, track]) => 
              track && (
                <audio
                  key={`${env.id}_${trackType}`}
                  ref={el => audioRefs.current[`${env.id}_${trackType}`] = el}
                  src={track.url}
                />
              )
            )}
          </div>
        ))}
        
        {environments.length === 0 && !showCreateForm && (
          <p className="text-gray-400 text-center py-8">
            No environments.<br/>
            Click + to get started!
          </p>
        )}
      </div>
    </div>
  );
};