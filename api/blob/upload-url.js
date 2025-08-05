// Upload URL handler for Vercel Blob client-side uploads
const { handleUpload } = require('@vercel/blob');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

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

    const jsonResponse = await handleUpload({
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log('Generating token for:', pathname);
        
        return {
          allowedContentTypes: [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
            'audio/m4a', 'audio/aac', 'audio/flac', 'audio/x-m4a'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(400).json({ 
      error: error.message,
    });
  }
};