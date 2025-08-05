const jwt = require('jsonwebtoken');

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

module.exports = async function handler(req, res) {
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

    const { filename, type } = req.body;
    
    if (!filename || !type) {
      res.status(400).json({
        success: false,
        message: 'Filename and type are required',
      });
      return;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobPath = `${payload.userId}/${type}/${timestamp}-${cleanName}`;

    // Return upload URL for client-side upload
    const uploadUrl = `/api/blob/upload?filename=${encodeURIComponent(blobPath)}`;

    res.status(200).json({
      success: true,
      uploadUrl,
      blobPath,
    });

  } catch (error) {
    console.error('Upload URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload URL',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};