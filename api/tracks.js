// Consolidated tracks endpoints
const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

if (!NEON_DATABASE_URL) {
  console.error('NEON_DATABASE_URL environment variable is not set');
}

const sql = neon(NEON_DATABASE_URL);

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

async function initTracksTable() {
  try {
    // Create tracks table with UUID user_id to match users table
    await sql`
      CREATE TABLE IF NOT EXISTS user_tracks (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('music', 'ambient', 'effect')),
        file_size BIGINT,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add foreign key constraint separately
    try {
      await sql`
        ALTER TABLE user_tracks 
        ADD CONSTRAINT IF NOT EXISTS user_tracks_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `;
    } catch (fkError) {
      console.log('Tracks foreign key constraint already exists or error:', fkError.message);
    }
    
    console.log('✅ user_tracks table initialized');
  } catch (error) {
    console.error('❌ Error initializing user_tracks table:', error);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
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

    await initTracksTable();

    const { id } = req.query;

    if (req.method === 'POST' && !id) {
      // Upload track metadata
      const { name, filename, url, type, fileSize, mimeType } = req.body;

      if (!name || !filename || !url || !type) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, filename, url, type',
        });
        return;
      }

      if (!['music', 'ambient', 'effect'].includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Type must be one of: music, ambient, effect',
        });
        return;
      }

      if (fileSize && fileSize > 50 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          message: 'File size too large (max 50MB)',
        });
        return;
      }

      const result = await sql`
        INSERT INTO user_tracks (user_id, name, filename, url, type, file_size, mime_type)
        VALUES (${payload.userId}, ${name}, ${filename}, ${url}, ${type}, ${fileSize || null}, ${mimeType || null})
        RETURNING *
      `;

      res.status(200).json({
        success: true,
        message: 'Track uploaded successfully',
        track: result[0],
      });

    } else if (req.method === 'GET' && !id) {
      // List tracks
      const { type } = req.query;
      
      let tracks;
      if (type && ['music', 'ambient', 'effect'].includes(type)) {
        tracks = await sql`
          SELECT * FROM user_tracks 
          WHERE user_id = ${payload.userId} AND type = ${type}
          ORDER BY created_at DESC
        `;
      } else {
        tracks = await sql`
          SELECT * FROM user_tracks 
          WHERE user_id = ${payload.userId}
          ORDER BY created_at DESC
        `;
      }

      res.status(200).json({
        success: true,
        tracks,
      });

    } else if (id) {
      // Track-specific operations
      const trackId = parseInt(id);
      
      if (isNaN(trackId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid track ID',
        });
        return;
      }

      if (req.method === 'GET') {
        // Get specific track
        const tracks = await sql`
          SELECT * FROM user_tracks 
          WHERE id = ${trackId} AND user_id = ${payload.userId}
        `;

        if (tracks.length === 0) {
          res.status(404).json({
            success: false,
            message: 'Track not found',
          });
          return;
        }

        res.status(200).json({
          success: true,
          track: tracks[0],
        });

      } else if (req.method === 'DELETE') {
        // Delete track
        const result = await sql`
          DELETE FROM user_tracks 
          WHERE id = ${trackId} AND user_id = ${payload.userId}
          RETURNING *
        `;

        if (result.length === 0) {
          res.status(404).json({
            success: false,
            message: 'Track not found',
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: 'Track deleted successfully',
          track: result[0],
        });

      } else {
        res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
      }

    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
    }

  } catch (error) {
    console.error('Tracks API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};