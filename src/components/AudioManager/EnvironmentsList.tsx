import React, { useEffect } from 'react';
import { Music, Plus, Edit, Play, Pause, Trash2 } from 'lucide-react';
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
    deleteEnvironment,
    fetchEnvironments,
    loading,
    setEditingEnvironment, 
    getTrackIcon 
  } = useEnvironments();
  
  const { playTrack } = useAudioManager();

  // Load environments on mount
  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  return (
    <div className="medieval-card p-6 relative">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-6 h-6 border-l border-t border-medieval-gold/40"></div>
      <div className="absolute top-2 right-2 w-6 h-6 border-r border-t border-medieval-gold/40"></div>
      <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b border-medieval-gold/40"></div>
      <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b border-medieval-gold/40"></div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="medieval-heading text-xl font-semibold flex items-center gap-2 text-shadow-medieval">
          <Music size={20} />
          Guild Sanctums
        </h2>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="medieval-btn medieval-btn-primary p-2 rounded"
            title="Create New Sanctum"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-medieval-brown/40 border border-medieval-gold/30 p-4 rounded-lg mb-4">
          <input
            type="text"
            value={newEnvironmentName}
            onChange={(e) => setNewEnvironmentName(e.target.value)}
            placeholder="Name thy sanctum..."
            className="medieval-input w-full p-2 rounded mb-3"
            onKeyPress={(e) => e.key === 'Enter' && createEnvironment()}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={createEnvironment}
              disabled={!newEnvironmentName.trim()}
              className="medieval-btn medieval-btn-success flex-1 px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Forge Sanctum
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewEnvironmentName('');
              }}
              className="medieval-btn flex-1 px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center text-medieval-parchment/70 py-8">
          <div className="medieval-text">Loading sanctums...</div>
        </div>
      ) : environments.length === 0 ? (
        <div className="text-center text-medieval-parchment/70 py-8">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-50 text-medieval-gold" />
          <p className="text-lg font-medium mb-1 medieval-text text-medieval-gold">No sanctums yet</p>
          <p className="text-sm medieval-text">Forge your first sanctum to begin thy journey</p>
        </div>
      ) : (
        <div className="space-y-3">
          {environments.map(env => (
            <div key={env.id} className="bg-medieval-brown/40 border border-medieval-gold/30 p-4 rounded">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold medieval-text text-medieval-gold text-shadow-medieval">{env.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingEnvironment(env)}
                    className="medieval-btn p-1 rounded"
                    title="Modify Sanctum"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Destroy sanctum "${env.name}"?`)) {
                        deleteEnvironment(env.id);
                      }
                    }}
                    className="medieval-btn medieval-btn-danger p-1 rounded"
                    title="Destroy Sanctum"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Quick Music Controls */}
              <div className="grid grid-cols-3 gap-2">
                {(['combat', 'exploration', 'tension'] as const).map(trackType => (
                  <button
                    key={trackType}
                    onClick={() => playTrack(env.id, trackType)}
                    disabled={!env.tracks[trackType]}
                    className={`p-3 rounded text-xs flex flex-col items-center gap-1 medieval-text transition-all ${
                      !env.tracks[trackType] 
                        ? 'bg-medieval-stone/40 text-medieval-parchment/40 cursor-not-allowed border border-medieval-stone/20' 
                        : (isPlaying[trackType] && currentPlayingEnv === env.id)
                          ? 'bg-medieval-forest border-medieval-gold text-medieval-parchment shadow-medieval-glow'
                          : 'bg-medieval-brown border-medieval-brown-light hover:bg-medieval-brown-light hover:border-medieval-gold/50 text-medieval-parchment/90'
                    }`}
                  >
                    <span className="text-lg">{getTrackIcon(trackType)}</span>
                    <div className="flex items-center justify-center w-5 h-5">
                      {isPlaying[trackType] && currentPlayingEnv === env.id ? (
                        <Pause size={12} />
                      ) : (
                        <Play size={12} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-medieval-parchment/70 medieval-text mt-2">
                Scrolls: {Object.values(env.tracks).filter(Boolean).length}/3
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
        </div>
      )}
    </div>
  );
};