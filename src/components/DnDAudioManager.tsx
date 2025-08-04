import React, { useState, useRef, useCallback } from 'react';
import { Play, Pause, Square, Upload, Plus, Volume2, VolumeX, Settings, Music, Zap, Wind, Edit } from 'lucide-react';

const DnDAudioManager = () => {
  const [environments, setEnvironments] = useState([]);
  const [editingEnvironment, setEditingEnvironment] = useState(null);
  const [isPlaying, setIsPlaying] = useState({
    combat: false,
    exploration: false,
    sneak: false
  });
  const [currentPlayingEnv, setCurrentPlayingEnv] = useState(null);
  const [volumes, setVolumes] = useState({
    music: 0.7,
    ambient: 0.5,
    spot: 0.8
  });
  const [activeAmbient, setActiveAmbient] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  const [globalAmbientSounds, setGlobalAmbientSounds] = useState({});
  const [globalSpotSounds, setGlobalSpotSounds] = useState({});
  
  const audioRefs = useRef({});
  const ambientRefs = useRef({});
  const spotRefs = useRef({});

  // Predefined ambient sounds
  const predefinedAmbient = [
    { id: 'rain', name: 'Pioggia', icon: '🌧️' },
    { id: 'wind', name: 'Vento', icon: '💨' },
    { id: 'fire', name: 'Fuoco', icon: '🔥' },
    { id: 'forest', name: 'Foresta', icon: '🌲' },
    { id: 'city', name: 'Città', icon: '🏙️' },
    { id: 'water', name: 'Acqua', icon: '🌊' }
  ];

  // Predefined spot sounds
  const predefinedSpots = [
    { id: 'dragon', name: 'Drago', key: '1', icon: '🐉' },
    { id: 'sword', name: 'Spada', key: '2', icon: '⚔️' },
    { id: 'magic', name: 'Magia', key: '3', icon: '✨' },
    { id: 'door', name: 'Porta', key: '4', icon: '🚪' },
    { id: 'steps', name: 'Passi', key: '5', icon: '👣' },
    { id: 'wolf', name: 'Lupo', key: '6', icon: '🐺' }
  ];

  const createEnvironment = () => {
    if (newEnvironmentName.trim()) {
      const newEnv = {
        id: Date.now(),
        name: newEnvironmentName.trim(),
        tracks: {
          combat: null,
          exploration: null,
          sneak: null
        }
      };
      setEnvironments([...environments, newEnv]);
      setNewEnvironmentName('');
      setShowCreateForm(false);
    }
  };

  const handleFileUpload = (envId, trackType, file) => {
    if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
      const url = URL.createObjectURL(file);
      setEnvironments(envs => 
        envs.map(env => 
          env.id === envId 
            ? { 
                ...env, 
                tracks: { 
                  ...env.tracks, 
                  [trackType]: { url, name: file.name } 
                } 
              }
            : env
        )
      );
    }
  };

  const handleGlobalAmbientUpload = (soundId, file) => {
    if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
      const url = URL.createObjectURL(file);
      setGlobalAmbientSounds(prev => ({
        ...prev,
        [soundId]: { url, name: file.name }
      }));
    }
  };

  const handleGlobalSpotUpload = (soundId, file) => {
    if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
      const url = URL.createObjectURL(file);
      setGlobalSpotSounds(prev => ({
        ...prev,
        [soundId]: { url, name: file.name }
      }));
    }
  };

  const playTrack = (envId, trackType) => {
    const env = environments.find(e => e.id === envId);
    if (!env?.tracks[trackType]) return;
    
    // Stop all other tracks
    Object.keys(isPlaying).forEach(key => {
      if (audioRefs.current[`${currentPlayingEnv}_${key}`]) {
        audioRefs.current[`${currentPlayingEnv}_${key}`].pause();
      }
    });
    
    const audioKey = `${envId}_${trackType}`;
    const audio = audioRefs.current[audioKey];
    
    if (audio) {
      if (isPlaying[trackType] && currentPlayingEnv === envId) {
        audio.pause();
        setIsPlaying(prev => ({ ...prev, [trackType]: false }));
        setCurrentPlayingEnv(null);
      } else {
        audio.volume = volumes.music;
        audio.loop = true;
        audio.play();
        setIsPlaying({
          combat: trackType === 'combat',
          exploration: trackType === 'exploration',
          sneak: trackType === 'sneak'
        });
        setCurrentPlayingEnv(envId);
      }
    }
  };

  const toggleAmbient = (soundId) => {
    const isActive = activeAmbient.includes(soundId);
    
    if (isActive) {
      if (ambientRefs.current[soundId]) {
        ambientRefs.current[soundId].pause();
      }
      setActiveAmbient(prev => prev.filter(id => id !== soundId));
    } else {
      const audio = ambientRefs.current[soundId];
      if (audio) {
        audio.volume = volumes.ambient;
        audio.loop = true;
        audio.play();
      }
      setActiveAmbient(prev => [...prev, soundId]);
    }
  };

  const playSpot = (soundId) => {
    const audio = spotRefs.current[soundId];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volumes.spot;
      audio.play();
    }
  };

  const stopAll = () => {
    // Stop all tracks
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) audio.pause();
    });
    
    // Stop all ambient
    Object.values(ambientRefs.current).forEach(audio => {
      if (audio) audio.pause();
    });
    
    setIsPlaying({ combat: false, exploration: false, sneak: false });
    setActiveAmbient([]);
    setCurrentPlayingEnv(null);
  };

  const updateVolume = (type, value) => {
    setVolumes(prev => ({ ...prev, [type]: value }));
    
    if (type === 'ambient') {
      activeAmbient.forEach(soundId => {
        if (ambientRefs.current[soundId]) {
          ambientRefs.current[soundId].volume = value;
        }
      });
    } else if (['combat', 'exploration', 'sneak'].includes(type)) {
      const activeAudioKey = `${currentPlayingEnv}_${type}`;
      if (audioRefs.current[activeAudioKey] && isPlaying[type]) {
        audioRefs.current[activeAudioKey].volume = value;
      }
    }
  };

  const getTrackIcon = (trackType) => {
    switch(trackType) {
      case 'combat': return '⚔️';
      case 'exploration': return '🗺️';
      case 'sneak': return '🥷';
      default: return '🎵';
    }
  };

  const getTrackName = (trackType) => {
    switch(trackType) {
      case 'combat': return 'Combattimento';
      case 'exploration': return 'Esplorazione';
      case 'sneak': return 'Sneak';
      default: return trackType;
    }
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      const spot = predefinedSpots.find(s => s.key === e.key);
      if (spot && globalSpotSounds[spot.id]) {
        playSpot(spot.id);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [globalSpotSounds]);

  // Editing Environment View
  if (editingEnvironment) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditingEnvironment(null)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
              >
                ← Indietro
              </button>
              <h1 className="text-2xl font-bold">🎵 Gestisci: {editingEnvironment.name}</h1>
            </div>
          </div>

          {/* Music Tracks */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Music size={20} />
              Tracce Musicali
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {['combat', 'exploration', 'sneak'].map(trackType => (
                <div key={trackType} className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-medium mb-4 text-center flex items-center justify-center gap-2">
                    {getTrackIcon(trackType)}
                    {getTrackName(trackType)}
                  </h3>
                  
                  {editingEnvironment.tracks[trackType] ? (
                    <div className="text-center">
                      <div className="mb-4 p-3 bg-gray-600 rounded">
                        <p className="text-sm text-green-400 mb-2">✓ Caricato</p>
                        <p className="text-xs text-gray-300 truncate">
                          {editingEnvironment.tracks[trackType].name}
                        </p>
                      </div>
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                        Cambia File
                        <input
                          type="file"
                          accept="audio/*,video/mp4"
                          className="hidden"
                          onChange={(e) => handleFileUpload(editingEnvironment.id, trackType, e.target.files[0])}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-3 cursor-pointer bg-gray-600 hover:bg-gray-500 p-6 rounded border-2 border-dashed border-gray-500 hover:border-gray-400">
                      <Upload size={24} />
                      <span className="text-sm text-center">
                        Clicca per caricare<br/>la traccia {getTrackName(trackType).toLowerCase()}
                      </span>
                      <input
                        type="file"
                        accept="audio/*,video/mp4"
                        className="hidden"
                        onChange={(e) => handleFileUpload(editingEnvironment.id, trackType, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🎵 D&D Audio Manager</h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={stopAll}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2"
            >
              <Square size={16} />
              Stop All
            </button>
          </div>
        </div>

        {/* Volume Controls */}
        {showSettings && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-4">Controlli Volume</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(volumes).map(([type, value]) => (
                <div key={type} className="flex flex-col">
                  <label className="text-sm mb-1 capitalize">{type}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={value}
                    onChange={(e) => updateVolume(type, parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{Math.round(value * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Environments */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Music size={20} />
                Ambientazioni
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
                  placeholder="Nome ambientazione"
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
                    Crea
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewEnvironmentName('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm"
                  >
                    Annulla
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
                    {['combat', 'exploration', 'sneak'].map(trackType => (
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
                    Tracce: {Object.values(env.tracks).filter(Boolean).length}/3
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
                  Nessuna ambientazione.<br/>
                  Clicca + per iniziare!
                </p>
              )}
            </div>
          </div>

          {/* Ambient Sounds */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wind size={20} />
              Suoni Ambientali
            </h2>
            
            <div className="grid grid-cols-2 gap-2">
              {predefinedAmbient.map(ambient => (
                <div key={ambient.id} className="p-2 bg-gray-700 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {ambient.icon} {ambient.name}
                    </span>
                    <button
                      onClick={() => toggleAmbient(ambient.id)}
                      className={`p-1 rounded text-xs ${
                        activeAmbient.includes(ambient.id)
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      disabled={!globalAmbientSounds[ambient.id]}
                    >
                      {activeAmbient.includes(ambient.id) ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                  </div>
                  
                  {globalAmbientSounds[ambient.id] ? (
                    <audio
                      ref={el => ambientRefs.current[ambient.id] = el}
                      src={globalAmbientSounds[ambient.id].url}
                    />
                  ) : (
                    <label className="flex items-center gap-1 cursor-pointer bg-gray-600 hover:bg-gray-500 p-1 rounded text-xs">
                      <Upload size={12} />
                      Carica
                      <input
                        type="file"
                        accept="audio/*,video/mp4"
                        className="hidden"
                        onChange={(e) => handleGlobalAmbientUpload(ambient.id, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Spot Sounds */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap size={20} />
              Effetti Sonori
            </h2>
            
            <div className="grid grid-cols-2 gap-2">
              {predefinedSpots.map(spot => (
                <div key={spot.id} className="p-2 bg-gray-700 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {spot.icon} {spot.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <kbd className="bg-gray-600 px-1 rounded text-xs">{spot.key}</kbd>
                      <button
                        onClick={() => playSpot(spot.id)}
                        className="p-1 rounded text-xs bg-purple-600 hover:bg-purple-700"
                        disabled={!globalSpotSounds[spot.id]}
                      >
                        <Play size={12} />
                      </button>
                    </div>
                  </div>
                  
                  {globalSpotSounds[spot.id] ? (
                    <audio
                      ref={el => spotRefs.current[spot.id] = el}
                      src={globalSpotSounds[spot.id].url}
                    />
                  ) : (
                    <label className="flex items-center gap-1 cursor-pointer bg-gray-600 hover:bg-gray-500 p-1 rounded text-xs">
                      <Upload size={12} />
                      Carica
                      <input
                        type="file"
                        accept="audio/*,video/mp4"
                        className="hidden"
                        onChange={(e) => handleGlobalSpotUpload(spot.id, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-2 bg-gray-700 rounded">
              <p className="text-xs text-gray-400">
                💡 Usa i tasti numerici (1-6) per attivare rapidamente gli effetti sonori!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DnDAudioManager;