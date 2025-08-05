// Types for track management
export interface UploadedTrack {
  id: string;
  name: string;
  filename: string;
  url: string;
  type: 'ambient' | 'effect' | 'music';
  duration?: number;
  fileSize: number;
  mimeType: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackUploadRequest {
  file: File;
  type: 'ambient' | 'effect' | 'music';
  name?: string;
}

export interface TrackUploadResponse {
  success: boolean;
  track?: UploadedTrack;
  message?: string;
}