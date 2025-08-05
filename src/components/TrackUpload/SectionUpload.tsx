import React, { useState, useRef } from 'react';
import { Upload, Plus, Music, Volume2, Zap } from 'lucide-react';

interface SectionUploadProps {
  trackType: 'music' | 'ambient' | 'effect';
  onUploadSuccess: (track: any) => void;
  onUploadError: (error: string) => void;
  color: string;
  hoverColor: string;
}

export const SectionUpload: React.FC<SectionUploadProps> = ({
  trackType,
  onUploadSuccess,
  onUploadError,
  color,
  hoverColor,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTypeIcon = () => {
    switch (trackType) {
      case 'music': return Music;
      case 'ambient': return Volume2;
      case 'effect': return Zap;
    }
  };

  const getTypeLabel = () => {
    switch (trackType) {
      case 'music': return 'Music Track';
      case 'ambient': return 'Ambient Sound';
      case 'effect': return 'Sound Effect';
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      'audio/m4a', 'audio/aac', 'audio/flac', 'audio/x-m4a'
    ];
    
    if (!allowedTypes.some(type => file.type === type || file.name.toLowerCase().includes(type.split('/')[1]))) {
      return 'Please upload an audio file (MP3, WAV, OGG, M4A, AAC, FLAC)';
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      let uploadResult;
      
      // Use different upload strategies based on file size
      if (file.size <= 4 * 1024 * 1024) { // 4MB - use direct upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', trackType);
        
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
        
        uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || 'Upload failed');
        }
      } else {
        // Large files - use client-side upload to Vercel Blob with direct token
        const { put } = await import('@vercel/blob');
        
        // Get the blob token from our API
        const tokenResponse = await fetch(`/api/blob/upload-url?token=${encodeURIComponent(token)}`);
        
        if (!tokenResponse.ok) {
          throw new Error('Failed to get upload token');
        }
        
        const tokenData = await tokenResponse.json();
        
        const blobPath = `tracks/${trackType}/${timestamp}-${cleanName}`;
        
        const blob = await put(blobPath, file, {
          access: 'public',
          token: tokenData.token,
        });
        
        uploadResult = {
          success: true,
          url: blob.url,
          filename: cleanName,
        };
      }
      
      // Save metadata to database
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
          type: trackType,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });

      const result = await metadataResponse.json();

      if (result.success) {
        onUploadSuccess(result.track);
      } else {
        onUploadError(result.message || 'Failed to save track metadata');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.message?.includes('413') || error.message?.includes('Too Large')) {
        onUploadError('File is too large. Please try a smaller file.');
      } else {
        onUploadError(error.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      onUploadError(validationError);
      return;
    }

    uploadFile(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const Icon = getTypeIcon();

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={handleButtonClick}
        disabled={uploading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
          uploading 
            ? 'bg-gray-600 cursor-not-allowed' 
            : `${color} ${hoverColor}`
        }`}
        title={`Upload ${getTypeLabel()}`}
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Uploading...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add {trackType === 'effect' ? 'Effect' : trackType.charAt(0).toUpperCase() + trackType.slice(1)}
          </>
        )}
      </button>
    </>
  );
};