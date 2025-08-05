// Database initialization script
const { neon } = require('@neondatabase/serverless');

// Initialize Neon client
const sql = neon(process.env.NEON_DATABASE_URL);

async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Create users table (if not exists from auth setup)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;
    
    // Create user_tracks table
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
    
    console.log('✅ Database tables initialized successfully');
    return { success: true, message: 'Database initialized' };
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    const result = await initializeDatabase();
    res.status(200).json(result);
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Database initialization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};