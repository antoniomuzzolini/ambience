// One-time schema fix for UUID compatibility
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

    console.log('Starting schema fix...');
    
    // Check users table schema
    const userTableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('Users table schema:', userTableInfo);

    // Check if tables exist and their schemas
    const tablesInfo = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_tracks', 'user_environments')
    `;
    
    console.log('Existing tables:', tablesInfo);

    // Drop and recreate user_tracks table with correct schema
    console.log('Recreating user_tracks table...');
    await sql`DROP TABLE IF EXISTS user_tracks CASCADE`;
    
    await sql`
      CREATE TABLE user_tracks (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('music', 'ambient', 'effect')),
        file_size BIGINT,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Drop and recreate user_environments table with correct schema
    console.log('Recreating user_environments table...');
    await sql`DROP TABLE IF EXISTS user_environments CASCADE`;
    
    await sql`
      CREATE TABLE user_environments (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        combat_track_id INTEGER NULL,
        exploration_track_id INTEGER NULL,
        tension_track_id INTEGER NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (combat_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL,
        FOREIGN KEY (exploration_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL,
        FOREIGN KEY (tension_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL
      )
    `;

    console.log('Schema fix completed successfully!');

    res.status(200).json({
      success: true,
      message: 'Database schema fixed successfully',
      userTableSchema: userTableInfo,
      tablesRecreated: ['user_tracks', 'user_environments']
    });

  } catch (error) {
    console.error('Schema fix error:', error);
    res.status(500).json({
      success: false,
      message: 'Schema fix failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};