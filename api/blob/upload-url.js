// Upload URL handler for Vercel Blob client-side uploads
const { handleUpload } = require('@vercel/blob/client');

module.exports = async function handler(req, res) {
  try {
    const jsonResponse = await handleUpload({
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        console.log('Generating token for:', pathname);
        
        return {
          allowedContentTypes: [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
            'audio/m4a', 'audio/aac', 'audio/flac', 'audio/x-m4a'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
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