const { put } = require('@vercel/blob');

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
    const { filename } = req.query;
    
    if (!filename) {
      res.status(400).json({
        success: false,
        message: 'Filename is required',
      });
      return;
    }

    // Upload to Vercel Blob
    const blob = await put(filename, req.body, {
      access: 'public',
    });

    res.status(200).json({
      success: true,
      url: blob.url,
    });

  } catch (error) {
    console.error('Blob upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};