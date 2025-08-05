const { put } = require('@vercel/blob');
const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

// Initialize Neon client
const sql = neon(process.env.NEON_DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Initialize tracks table
async function initTracksTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_tracks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('ambient', 'effect', 'music')),
        duration INTEGER,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        user_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_tracks_user_id ON user_tracks(user_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_tracks_type ON user_tracks(type)
    `;
  } catch (error) {
    console.error('Failed to initialize tracks table:', error);
    throw error;
  }
}

// Save track metadata to database
async function saveTrackMetadata(trackData) {
  const result = await sql`
    INSERT INTO user_tracks (name, filename, url, type, duration, file_size, mime_type, user_id)
    VALUES (${trackData.name}, ${trackData.filename}, ${trackData.url}, ${trackData.type}, 
            ${trackData.duration}, ${trackData.fileSize}, ${trackData.mimeType}, ${trackData.userId})
    RETURNING id, name, filename, url, type, duration, file_size, mime_type, user_id, created_at, updated_at
  `;
  return result[0];
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    // Initialize database
    await initTracksTable();

    // Parse JSON body (metadata only approach)
    const { name, filename, url, type, fileSize, mimeType } = req.body;
    
    if (!name || !filename || !url || !type || !fileSize || !mimeType) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: name, filename, url, type, fileSize, mimeType',
      });
      return;
    }

    // Validate file type (audio files only)
    const allowedMimeTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
      'audio/m4a', 'audio/aac', 'audio/flac'
    ];
    
    if (!allowedMimeTypes.includes(mimeType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid file type. Only audio files are allowed.',
      });
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (fileSize > maxSize) {
      res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 50MB allowed.',
      });
      return;
    }

    // Save metadata to database
    const trackData = {
      name,
      filename,
      url,
      type,
      duration: null, // Could be extracted from file metadata if needed
      fileSize,
      mimeType,
      userId: payload.userId,
    };

    const savedTrack = await saveTrackMetadata(trackData);

    // Return success response
    res.status(200).json({
      success: true,
      track: {
        id: savedTrack.id,
        name: savedTrack.name,
        filename: savedTrack.filename,
        url: savedTrack.url,
        type: savedTrack.type,
        duration: savedTrack.duration,
        fileSize: savedTrack.file_size,
        mimeType: savedTrack.mime_type,
        userId: savedTrack.user_id,
        createdAt: new Date(savedTrack.created_at),
        updatedAt: new Date(savedTrack.updated_at),
      },
      message: 'Track uploaded successfully',
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};