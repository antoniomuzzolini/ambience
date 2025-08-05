// Serverless function for token verification
import { AuthService } from '../../src/lib/auth';

export default async function handler(req: any, res: any) {
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

    // Initialize the database
    await AuthService.initialize();

    // Verify the token
    const user = await AuthService.verifyUser(token);

    if (user) {
      res.status(200).json({
        success: true,
        user,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}