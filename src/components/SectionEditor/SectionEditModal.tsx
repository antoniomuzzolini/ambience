import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, GripVertical, Trash2, Plus } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  icon: string;
  file?: string;
  url?: string;
  source: 'builtin' | 'uploaded';
}

interface UploadedTrack {
  id: number;
  name: string;
  url: string;
  type: string;
}

interface SectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: 'ambient' | 'effect';
  sectionTitle: string;
  onSave: (sounds: Sound[]) => void;
}

export const SectionEditModal: React.FC<SectionEditModalProps> = ({
  isOpen,
  onClose,
  sectionType,
  sectionTitle,
  onSave
}) => {
  const [currentSounds, setCurrentSounds] = useState<Sound[]>([]);
  const [availableTracks, setAvailableTracks] = useState<UploadedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchSectionConfig = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Get current section configuration
      const configResponse = await fetch(`/api/sections?section=${sectionType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (configResponse.ok) {
        const configResult = await configResponse.json();
        if (configResult.success) {
          setCurrentSounds(configResult.sounds || []);
        }
      }

      // Get available uploaded tracks
      const tracksResponse = await fetch(`/api/tracks?type=${sectionType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (tracksResponse.ok) {
        const tracksResult = await tracksResponse.json();
        if (tracksResult.success) {
          setAvailableTracks(tracksResult.tracks || []);
        }
      }

    } catch (error) {
      console.error('Error fetching section data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionConfig();
  }, [isOpen, sectionType]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;

    const newSounds = [...currentSounds];
    const draggedSound = newSounds[draggedIndex];
    
    // Remove from old position
    newSounds.splice(draggedIndex, 1);
    
    // Insert at new position
    newSounds.splice(dropIndex, 0, draggedSound);
    
    setCurrentSounds(newSounds);
    setDraggedIndex(null);
  };

  const removeSound = (index: number) => {
    const newSounds = currentSounds.filter((_, i) => i !== index);
    setCurrentSounds(newSounds);
  };

  const addTrack = (track: UploadedTrack) => {
    const newSound: Sound = {
      id: track.id.toString(),
      name: track.name,
      icon: sectionType === 'ambient' ? '🎵' : '🔊',
      url: track.url,
      source: 'uploaded'
    };

    setCurrentSounds(prev => [...prev, newSound]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sectionType,
          sounds: currentSounds
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        onSave(currentSounds);
        onClose();
      } else {
        alert('Failed to save configuration: ' + result.message);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(`Reset ${sectionTitle} to default sounds?`)) return;

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/sections?section=${sectionType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentSounds(result.defaultSounds || []);
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('Failed to reset configuration');
    }
  };

  // Filter out tracks that are already in the current sounds
  const usedTrackIds = new Set(
    currentSounds
      .filter(sound => sound.source === 'uploaded')
      .map(sound => parseInt(sound.id))
  );
  
  const unusedTracks = availableTracks.filter(track => !usedTrackIds.has(track.id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            Edit {sectionTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              Loading configuration...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Sounds */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Current Sounds ({currentSounds.length})
                </h3>
                
                {currentSounds.length === 0 ? (
                  <div className="text-gray-400 text-center py-4 border border-gray-600 rounded-lg border-dashed">
                    No sounds configured. Add some from your uploads below.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentSounds.map((sound, index) => (
                      <div
                        key={`${sound.source}-${sound.id}`}
                        className="bg-gray-700 p-3 rounded-lg flex items-center gap-3"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                        <span className="text-lg">{sound.icon}</span>
                        <span className="text-white flex-1">{sound.name}</span>
                        <span className="text-xs text-gray-400 px-2 py-1 bg-gray-600 rounded">
                          {sound.source}
                        </span>
                        <button
                          onClick={() => removeSound(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Remove sound"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Uploads */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Add From Your Uploads ({unusedTracks.length} available)
                </h3>
                
                {unusedTracks.length === 0 ? (
                  <div className="text-gray-400 text-center py-4 border border-gray-600 rounded-lg border-dashed">
                    {availableTracks.length === 0 
                      ? `No ${sectionType} tracks uploaded yet. Upload some in "My Tracks" first.`
                      : 'All your uploaded tracks are already in use.'
                    }
                  </div>
                ) : (
                  <div className="space-y-2">
                    {unusedTracks.map((track) => (
                      <div
                        key={track.id}
                        className="bg-gray-600 p-3 rounded-lg flex items-center gap-3"
                      >
                        <span className="text-lg">
                          {sectionType === 'ambient' ? '🎵' : '🔊'}
                        </span>
                        <span className="text-white flex-1">{track.name}</span>
                        <button
                          onClick={() => addTrack(track)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white flex items-center gap-2"
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded text-white flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};