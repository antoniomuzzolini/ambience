// Simple upload URL generator for large files
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  try {
    // Verify authentication from query parameter or header
    const token = req.query.token || req.headers.authorization?.substring(7);
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'Blob token not configured' });
    }

    // For large file uploads, we'll use a simple approach
    // Return the blob token so client can upload directly
    return res.status(200).json({
      token: BLOB_READ_WRITE_TOKEN,
      message: 'Use this token for direct upload',
    });

  } catch (error) {
    console.error('Upload URL error:', error);
    return res.status(500).json({ 
      error: error.message,
    });
  }
};