// Simple blob upload endpoint as fallback
const { put } = require('@vercel/blob');
const jwt = require('jsonwebtoken');

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

    const { filename, contentType } = req.query;
    
    if (!filename) {
      res.status(400).json({
        success: false,
        message: 'Filename is required',
      });
      return;
    }

    // Validate content type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
      'audio/m4a', 'audio/aac', 'audio/flac', 'audio/x-m4a'
    ];
    
    if (contentType && !allowedTypes.includes(contentType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid file type. Only audio files are allowed.',
      });
      return;
    }

    // Check content length (4MB limit for serverless functions)
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 4 * 1024 * 1024) {
      res.status(413).json({
        success: false,
        message: 'File too large for direct upload. Use client-side upload instead.',
      });
      return;
    }

    // Upload to Vercel Blob
    const blob = await put(filename, req.body, {
      access: 'public',
      contentType: contentType || 'application/octet-stream',
    });

    res.status(200).json({
      success: true,
      url: blob.url,
      filename: filename,
    });

  } catch (error) {
    console.error('Simple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};