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

// Get user tracks
async function getUserTracks(userId, type = null) {
  let query;
  if (type) {
    query = sql`
      SELECT id, name, filename, url, type, duration, file_size, mime_type, user_id, created_at, updated_at
      FROM user_tracks
      WHERE user_id = ${userId} AND type = ${type}
      ORDER BY created_at DESC
    `;
  } else {
    query = sql`
      SELECT id, name, filename, url, type, duration, file_size, mime_type, user_id, created_at, updated_at
      FROM user_tracks
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }
  
  return await query;
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
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

    // Get query parameters
    const { type } = req.query;

    // Get user tracks
    const tracks = await getUserTracks(payload.userId, type);

    // Format response
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      name: track.name,
      filename: track.filename,
      url: track.url,
      type: track.type,
      duration: track.duration,
      fileSize: track.file_size,
      mimeType: track.mime_type,
      userId: track.user_id,
      createdAt: new Date(track.created_at),
      updatedAt: new Date(track.updated_at),
    }));

    res.status(200).json({
      success: true,
      tracks: formattedTracks,
    });

  } catch (error) {
    console.error('List tracks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tracks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};