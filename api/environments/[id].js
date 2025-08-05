// Update or delete user environment
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

async function initEnvironmentsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_environments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        combat_track_id INTEGER NULL,
        exploration_track_id INTEGER NULL,
        sneak_track_id INTEGER NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (combat_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL,
        FOREIGN KEY (exploration_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL,
        FOREIGN KEY (sneak_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL
      )
    `;
  } catch (error) {
    console.error('❌ Error initializing user_environments table:', error);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!['PUT', 'DELETE'].includes(req.method)) {
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

    await initEnvironmentsTable();

    const { id } = req.query;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({
        success: false,
        message: 'Valid environment ID is required',
      });
      return;
    }

    const environmentId = parseInt(id);

    // Verify environment belongs to user
    const existing = await sql`
      SELECT id FROM user_environments 
      WHERE id = ${environmentId} AND user_id = ${payload.userId}
    `;

    if (existing.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Environment not found',
      });
      return;
    }

    if (req.method === 'DELETE') {
      // Delete environment
      await sql`
        DELETE FROM user_environments 
        WHERE id = ${environmentId} AND user_id = ${payload.userId}
      `;

      res.status(200).json({
        success: true,
        message: 'Environment deleted successfully',
      });

    } else if (req.method === 'PUT') {
      // Update environment
      const { name, combatTrackId, explorationTrackId, sneakTrackId } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Environment name is required',
        });
        return;
      }

      // Verify track IDs belong to user if provided
      const trackIds = [combatTrackId, explorationTrackId, sneakTrackId].filter(Boolean);
      if (trackIds.length > 0) {
        const userTracks = await sql`
          SELECT id FROM user_tracks 
          WHERE id = ANY(${trackIds}) AND user_id = ${payload.userId}
        `;
        
        const validTrackIds = userTracks.map(t => t.id);
        const invalidIds = trackIds.filter(id => !validTrackIds.includes(id));
        
        if (invalidIds.length > 0) {
          res.status(400).json({
            success: false,
            message: 'Some track IDs are invalid or do not belong to you',
          });
          return;
        }
      }

      const result = await sql`
        UPDATE user_environments 
        SET 
          name = ${name.trim()},
          combat_track_id = ${combatTrackId || null},
          exploration_track_id = ${explorationTrackId || null},
          sneak_track_id = ${sneakTrackId || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${environmentId} AND user_id = ${payload.userId}
        RETURNING *
      `;

      if (result.length === 0) {
        res.status(500).json({
          success: false,
          message: 'Failed to update environment',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Environment updated successfully',
        environment: result[0],
      });
    }

  } catch (error) {
    console.error('Environment operation error:', error);
    res.status(500).json({
      success: false,
      message: 'Database operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};