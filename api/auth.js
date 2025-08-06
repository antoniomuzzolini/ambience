// Consolidated auth endpoints
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

console.log('Auth API - Environment check:', {
  hasNeonUrl: !!NEON_DATABASE_URL,
  hasJwtSecret: !!JWT_SECRET,
  nodeEnv: process.env.NODE_ENV
});

if (!NEON_DATABASE_URL) {
  console.error('NEON_DATABASE_URL environment variable is not set');
}

const sql = neon(NEON_DATABASE_URL);

async function initUsersTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Users table initialized');
  } catch (error) {
    console.error('❌ Error initializing users table:', error);
    throw error;
  }
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  try {
    await initUsersTable();

    if (action === 'register' && req.method === 'POST') {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username and password are required',
        });
        return;
      }

      if (username.length < 3) {
        res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
        return;
      }

      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE username = ${username.toLowerCase()}
      `;

      if (existingUser.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Username already exists',
        });
        return;
      }

      // Hash password and create user
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const result = await sql`
        INSERT INTO users (username, password_hash)
        VALUES (${username.toLowerCase()}, ${hashedPassword})
        RETURNING id, username, created_at, updated_at
      `;

      if (result.length === 0) {
        res.status(500).json({
          success: false,
          message: 'Failed to create user',
        });
        return;
      }

      const user = result[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });

    } else if (action === 'login' && req.method === 'POST') {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username and password are required',
        });
        return;
      }

      // Find user
      const users = await sql`
        SELECT id, username, password_hash, created_at, updated_at 
        FROM users 
        WHERE username = ${username.toLowerCase()}
      `;

      if (users.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
        return;
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });

    } else if (action === 'verify' && req.method === 'POST') {
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
          message: 'Invalid or expired token',
        });
        return;
      }

      // Get fresh user data
      const users = await sql`
        SELECT id, username, created_at, updated_at 
        FROM users 
        WHERE id = ${payload.userId}
      `;

      if (users.length === 0) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const user = users[0];
      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });

    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed or invalid action',
      });
    }

  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};