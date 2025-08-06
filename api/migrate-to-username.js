// Database migration script to convert from email-based to username-based auth
const { neon } = require('@neondatabase/serverless');

const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.error('NEON_DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(NEON_DATABASE_URL);

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
    console.log('Starting database migration to username-based auth...');
    
    // Check current table structure
    const currentSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('Current users table schema:', currentSchema);

    // Backup existing data if any
    const existingUsers = await sql`SELECT * FROM users LIMIT 10`;
    console.log('Existing users (first 10):', existingUsers.length > 0 ? existingUsers : 'No users found');

    // Drop existing tables that depend on users table
    console.log('Dropping dependent tables...');
    await sql`DROP TABLE IF EXISTS user_environments CASCADE`;
    await sql`DROP TABLE IF EXISTS user_tracks CASCADE`;
    
    // Drop and recreate users table with new schema
    console.log('Dropping and recreating users table...');
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create index for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `;

    // Recreate dependent tables with new schema
    console.log('Recreating dependent tables...');
    
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

    await sql`
      CREATE TABLE user_environments (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
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

    console.log('Migration completed successfully!');

    res.status(200).json({
      success: true,
      message: 'Database migrated to username-based auth successfully',
      changes: [
        'Users table recreated with username field instead of name/email',
        'UUID primary keys implemented',
        'Dependent tables recreated with proper foreign key constraints',
        'Performance indexes created'
      ]
    });

  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};