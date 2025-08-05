import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

// Initialize Neon client
const sql = neon(process.env.NEON_DATABASE_URL);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Find user by ID
async function findUserById(id) {
  const result = await sql`
    SELECT id, name, email, created_at, updated_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  return result[0] || null;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the token
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    // Get user data
    const userData = await findUserById(payload.userId);
    if (!userData) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
    };

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}