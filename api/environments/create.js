// Create user environment
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
    console.log('✅ user_environments table initialized');
  } catch (error) {
    console.error('❌ Error initializing user_environments table:', error);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

    await initEnvironmentsTable();

    const { name, combatTrackId, explorationTrackId, sneakTrackId } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Environment name is required',
      });
      return;
    }

    // Create environment
    const result = await sql`
      INSERT INTO user_environments (user_id, name, combat_track_id, exploration_track_id, sneak_track_id)
      VALUES (${payload.userId}, ${name.trim()}, ${combatTrackId || null}, ${explorationTrackId || null}, ${sneakTrackId || null})
      RETURNING *
    `;

    if (result.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Failed to create environment',
      });
      return;
    }

    const environment = result[0];

    // Get track details if any are assigned
    let environmentWithTracks = environment;
    if (combatTrackId || explorationTrackId || sneakTrackId) {
      const trackIds = [combatTrackId, explorationTrackId, sneakTrackId].filter(Boolean);
      const tracks = await sql`
        SELECT id, name, url, type 
        FROM user_tracks 
        WHERE id = ANY(${trackIds}) AND user_id = ${payload.userId}
      `;

      const trackMap = tracks.reduce((acc, track) => {
        acc[track.id] = track;
        return acc;
      }, {});

      environmentWithTracks = {
        ...environment,
        combat_track: combatTrackId ? trackMap[combatTrackId] : null,
        exploration_track: explorationTrackId ? trackMap[explorationTrackId] : null,
        sneak_track: sneakTrackId ? trackMap[sneakTrackId] : null,
      };
    }

    res.status(200).json({
      success: true,
      message: 'Environment created successfully',
      environment: environmentWithTracks,
    });

  } catch (error) {
    console.error('Create environment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create environment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};