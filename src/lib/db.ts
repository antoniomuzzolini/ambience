import { neon } from '@neondatabase/serverless';

// Initialize Neon client
const sql = neon(process.env.NEON_DATABASE_URL || '');

// Database schema initialization
export const initDB = async () => {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Create index on username for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// User database operations
export const dbUsers = {
  // Create a new user
  async create(username: string, passwordHash: string) {
    const result = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${username}, ${passwordHash})
      RETURNING id, username, created_at, updated_at
    `;
    return result[0];
  },

  // Find user by username
  async findByUsername(username: string) {
    const result = await sql`
      SELECT id, username, password_hash, created_at, updated_at
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `;
    return result[0] || null;
  },

  // Find user by ID
  async findById(id: string) {
    const result = await sql`
      SELECT id, username, created_at, updated_at
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return result[0] || null;
  },

  // Update user
  async update(id: string, updates: { username?: string }) {
    const setClause = [];
    const values = [];
    
    if (updates.username) {
      setClause.push('username = $' + (values.length + 2));
      values.push(updates.username);
    }
    
    if (setClause.length === 0) {
      throw new Error('No valid updates provided');
    }
    
    setClause.push('updated_at = NOW()');
    
    const result = await sql`
      UPDATE users 
      SET ${sql.unsafe(setClause.join(', '))}
      WHERE id = ${id}
      RETURNING id, username, created_at, updated_at
    `;
    
    return result[0] || null;
  },

  // Delete user
  async delete(id: string) {
    const result = await sql`
      DELETE FROM users
      WHERE id = ${id}
      RETURNING id
    `;
    return result[0] || null;
  }
};

export { sql };