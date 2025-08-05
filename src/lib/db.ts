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
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Create index on email for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
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
  async create(name: string, email: string, passwordHash: string) {
    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email, created_at, updated_at
    `;
    return result[0];
  },

  // Find user by email
  async findByEmail(email: string) {
    const result = await sql`
      SELECT id, name, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
    return result[0] || null;
  },

  // Find user by ID
  async findById(id: string) {
    const result = await sql`
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return result[0] || null;
  },

  // Update user
  async update(id: string, updates: { name?: string; email?: string }) {
    const setClause = [];
    const values = [];
    
    if (updates.name) {
      setClause.push('name = $' + (values.length + 2));
      values.push(updates.name);
    }
    
    if (updates.email) {
      setClause.push('email = $' + (values.length + 2));
      values.push(updates.email);
    }
    
    if (setClause.length === 0) {
      throw new Error('No valid updates provided');
    }
    
    setClause.push('updated_at = NOW()');
    
    const result = await sql`
      UPDATE users 
      SET ${sql.unsafe(setClause.join(', '))}
      WHERE id = ${id}
      RETURNING id, name, email, created_at, updated_at
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