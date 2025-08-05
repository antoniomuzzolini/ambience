// Upload URL handler for Vercel Blob client-side uploads
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
    // This endpoint is used by @vercel/blob/client for generating upload URLs
    // The actual upload handling is done by Vercel Blob service
    
    // Simply return success - the real upload URL generation is handled by Vercel
    res.status(200).json({
      success: true,
      message: 'Upload URL endpoint ready'
    });

  } catch (error) {
    console.error('Upload URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle upload URL request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};