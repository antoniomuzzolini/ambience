import React, { useState, useRef } from 'react';
import { Upload, X, Music, Volume2, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TrackUploadRequest } from '../../types/tracks';
import { upload } from '@vercel/blob/client';

interface FileUploadProps {
  onUploadSuccess?: (track: any) => void;
  onUploadError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<'ambient' | 'effect' | 'music'>('ambient');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (!user) {
      onUploadError?.('You must be logged in to upload files');
      return;
    }

    // Filter audio files
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      onUploadError?.('Please select audio files only');
      return;
    }

    for (const file of audioFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const filename = file.name;
    setUploadingFiles(prev => [...prev, filename]);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Use direct multipart upload (more reliable)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);
      
      const uploadResponse = await fetch('/api/blob/direct-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Upload failed');
      }
      
      // Step 2: Save metadata to database
      const timestamp = Date.now();
      const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      const metadataResponse = await fetch('/api/tracks/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          filename: cleanName,
          url: uploadResult.url,
          type: selectedType,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });

      const result = await metadataResponse.json();

      if (result.success) {
        onUploadSuccess?.(result.track);
      } else {
        onUploadError?.(result.message || 'Failed to save track metadata');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingFiles(prev => prev.filter(f => f !== filename));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ambient': return <Volume2 className="h-4 w-4" />;
      case 'effect': return <Zap className="h-4 w-4" />;
      case 'music': return <Music className="h-4 w-4" />;
      default: return <Volume2 className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ambient': return 'bg-blue-600 hover:bg-blue-700';
      case 'effect': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'music': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5" />
        Upload Your Tracks
      </h3>

      {/* Track Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Track Type
        </label>
        <div className="flex gap-2">
          {(['ambient', 'effect', 'music'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedType === type
                  ? getTypeColor(type)
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {getTypeIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-2">
          Drag & drop audio files here, or click to select
        </p>
        <p className="text-gray-500 text-sm">
          Supports MP3, WAV, OGG, M4A, AAC, FLAC (max 50MB each)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-300 mb-2">Uploading files...</p>
          {uploadingFiles.map((filename) => (
            <div key={filename} className="flex items-center gap-2 text-sm text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              {filename}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};