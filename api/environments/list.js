// List user environments
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

    await initEnvironmentsTable();

    // Get environments with track details
    const environments = await sql`
      SELECT 
        e.*,
        ct.name as combat_track_name,
        ct.url as combat_track_url,
        ct.id as combat_track_id,
        et.name as exploration_track_name,
        et.url as exploration_track_url,
        et.id as exploration_track_id,
        st.name as sneak_track_name,
        st.url as sneak_track_url,
        st.id as sneak_track_id
      FROM user_environments e
      LEFT JOIN user_tracks ct ON e.combat_track_id = ct.id
      LEFT JOIN user_tracks et ON e.exploration_track_id = et.id
      LEFT JOIN user_tracks st ON e.sneak_track_id = st.id
      WHERE e.user_id = ${payload.userId}
      ORDER BY e.created_at DESC
    `;

    // Transform to match frontend structure
    const transformedEnvironments = environments.map(env => ({
      id: env.id,
      name: env.name,
      created_at: env.created_at,
      updated_at: env.updated_at,
      tracks: {
        combat: env.combat_track_id ? {
          id: env.combat_track_id,
          name: env.combat_track_name,
          url: env.combat_track_url
        } : null,
        exploration: env.exploration_track_id ? {
          id: env.exploration_track_id,
          name: env.exploration_track_name,
          url: env.exploration_track_url
        } : null,
        sneak: env.sneak_track_id ? {
          id: env.sneak_track_id,
          name: env.sneak_track_name,
          url: env.sneak_track_url
        } : null
      }
    }));

    res.status(200).json({
      success: true,
      environments: transformedEnvironments,
    });

  } catch (error) {
    console.error('List environments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load environments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};