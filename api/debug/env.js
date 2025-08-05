// Debug endpoint to check environment variables
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN ? 
      process.env.BLOB_READ_WRITE_TOKEN.substring(0, 10) + '...' : 
      'not found';

    res.status(200).json({
      success: true,
      hasToken,
      tokenPrefix,
      envKeys: Object.keys(process.env).filter(key => 
        key.includes('BLOB') || key.includes('VERCEL')
      ).sort(),
    });
  } catch (error) {
    console.error('Debug env error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};