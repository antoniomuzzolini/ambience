const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Neon client
const sql = neon(process.env.NEON_DATABASE_URL);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Validate input
    if (!email.trim() || !password.trim()) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Find user
    const userData = await findUserByEmail(email.toLowerCase());
    if (!userData) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, userData.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
    };

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      user,
      token,
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
}