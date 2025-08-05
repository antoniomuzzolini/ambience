import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Neon client
const sql = neon(process.env.NEON_DATABASE_URL);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Initialize database tables
async function initDB() {
  try {
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
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Hash password
async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Generate JWT token
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Create user
async function createUser(name, email, passwordHash) {
  const result = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${name}, ${email}, ${passwordHash})
    RETURNING id, name, email, created_at, updated_at
  `;
  return result[0];
}

// Find user by email
async function findUserByEmail(email) {
  const result = await sql`
    SELECT id, name, email, password_hash, created_at, updated_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  return result[0] || null;
}

export default async function handler(req, res) {
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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
      return;
    }

    // Validate input
    if (!name.trim()) {
      res.status(400).json({ success: false, message: 'Name is required' });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Valid email is required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    // Initialize the database
    await initDB();

    // Check if user already exists
    const existingUser = await findUserByEmail(email.toLowerCase());
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userData = await createUser(name.trim(), email.toLowerCase(), passwordHash);

    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
    };

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      user,
      token,
      message: 'Registration successful',
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
}