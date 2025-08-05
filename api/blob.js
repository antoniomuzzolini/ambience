// Consolidated blob endpoints
const { put } = require('@vercel/blob');
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

// Simple multipart form parser
function parseMultipartForm(body, boundary) {
  const parts = body.split(`--${boundary}`);
  const files = {};
  const fields = {};

  for (const part of parts) {
    if (part.includes('Content-Disposition')) {
      const lines = part.split('\r\n');
      const dispositionLine = lines.find(line => line.includes('Content-Disposition'));
      
      if (dispositionLine) {
        const nameMatch = dispositionLine.match(/name="([^"]+)"/);
        const filenameMatch = dispositionLine.match(/filename="([^"]+)"/);
        
        if (nameMatch) {
          const fieldName = nameMatch[1];
          const content = part.split('\r\n\r\n')[1]?.split('\r\n--')[0];
          
          if (filenameMatch && content) {
            // It's a file
            files[fieldName] = {
              filename: filenameMatch[1],
              data: Buffer.from(content, 'binary')
            };
          } else if (content) {
            // It's a regular field
            fields[fieldName] = content;
          }
        }
      }
    }
  }

  return { files, fields };
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
    // Verify authentication
    const token = req.query.token || req.headers.authorization?.substring(7);
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    if (action === 'upload-url' && req.method === 'GET') {
      // Get upload token for large files
      if (!BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({ error: 'Blob token not configured' });
      }

      return res.status(200).json({
        token: BLOB_READ_WRITE_TOKEN,
        message: 'Use this token for direct upload',
      });

    } else if (action === 'direct-upload' && req.method === 'POST') {
      // Direct upload for small files
      const contentType = req.headers['content-type'] || '';
      
      if (contentType.includes('multipart/form-data')) {
        // Handle multipart form data
        const boundary = contentType.split('boundary=')[1];
        if (!boundary) {
          res.status(400).json({
            success: false,
            message: 'No boundary found in multipart data',
          });
          return;
        }

        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        const { files, fields } = parseMultipartForm(buffer.toString('binary'), boundary);
        
        if (!files.file) {
          res.status(400).json({
            success: false,
            message: 'No file found in upload',
          });
          return;
        }

        const file = files.file;
        const type = fields.type || 'ambient';
        const timestamp = Date.now();
        const cleanName = file.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const blobPath = `tracks/${type}/${timestamp}-${cleanName}`;

        console.log(`Uploading ${blobPath}, size: ${file.data.length} bytes`);

        const blob = await put(blobPath, file.data, {
          access: 'public',
          contentType: req.headers['content-type'] || 'application/octet-stream',
        });

        res.status(200).json({
          success: true,
          url: blob.url,
          filename: cleanName,
        });

      } else {
        res.status(400).json({
          success: false,
          message: 'Content-Type must be multipart/form-data',
        });
      }

    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed or invalid action',
      });
    }

  } catch (error) {
    console.error('Blob API error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};