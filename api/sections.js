// User section configuration management
const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

if (!NEON_DATABASE_URL) {
  console.error('NEON_DATABASE_URL environment variable is not set');
}

const sql = neon(NEON_DATABASE_URL);

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Default built-in sounds configuration
const DEFAULT_SOUNDS = {
  ambient: [
    { id: 'city', name: 'City', icon: '🏙️', file: 'city.mp3', source: 'builtin' },
    { id: 'waves', name: 'Waves', icon: '🌊', file: 'waves.mp3', source: 'builtin' },
    { id: 'wind', name: 'Wind', icon: '💨', file: 'wind.mp3', source: 'builtin' },
    { id: 'fire', name: 'Fire', icon: '🔥', file: 'fire.m4a', source: 'builtin' },
    { id: 'forest', name: 'Forest', icon: '🌲', file: 'forest.mp3', source: 'builtin' },
    { id: 'rain', name: 'Rain', icon: '🌧️', file: 'rain.m4a', source: 'builtin' },
    { id: 'war', name: 'War', icon: '⚔️', file: 'war.mp3', source: 'builtin' }
  ],
  effect: [
    { id: 'explosion', name: 'Explosion', icon: '💥', file: 'explosion.mp3', source: 'builtin' },
    { id: 'thunder', name: 'Thunder', icon: '⚡', file: 'thunder.mp3', source: 'builtin' },
    { id: 'wolf', name: 'Wolf', icon: '🐺', file: 'wolf.mp3', source: 'builtin' },
    { id: 'roar', name: 'Roar', icon: '🦁', file: 'roar.mp3', source: 'builtin' }
  ]
};

async function initSectionConfigTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_section_config (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        section_type VARCHAR(20) NOT NULL CHECK (section_type IN ('ambient', 'effect')),
        sound_id VARCHAR(255) NOT NULL,
        sound_source VARCHAR(20) NOT NULL CHECK (sound_source IN ('builtin', 'uploaded')),
        display_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add foreign key constraint
    try {
      await sql`
        ALTER TABLE user_section_config 
        ADD CONSTRAINT IF NOT EXISTS user_section_config_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `;
    } catch (fkError) {
      console.log('Section config foreign key constraint already exists:', fkError.message);
    }

    console.log('✅ user_section_config table initialized');
  } catch (error) {
    console.error('❌ Error initializing user_section_config table:', error);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
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

    await initSectionConfigTable();

    const { section } = req.query;

    if (req.method === 'GET') {
      // Get user's section configuration or return defaults
      if (section && ['ambient', 'effect'].includes(section)) {
        // Get specific section config
        const userConfig = await sql`
          SELECT sound_id, sound_source, display_order
          FROM user_section_config 
          WHERE user_id = ${payload.userId} AND section_type = ${section}
          ORDER BY display_order
        `;

        if (userConfig.length === 0) {
          // Return default configuration
          res.status(200).json({
            success: true,
            section: section,
            sounds: DEFAULT_SOUNDS[section],
            isDefault: true
          });
        } else {
          // Build configured sounds list
          const configuredSounds = [];
          
          for (const config of userConfig) {
            if (config.sound_source === 'builtin') {
              // Find built-in sound
              const builtinSound = DEFAULT_SOUNDS[section].find(s => s.id === config.sound_id);
              if (builtinSound) {
                configuredSounds.push(builtinSound);
              }
            } else if (config.sound_source === 'uploaded') {
              // Get uploaded track details
              const track = await sql`
                SELECT id, name, url, type
                FROM user_tracks 
                WHERE id = ${parseInt(config.sound_id)} AND user_id = ${payload.userId}
              `;
              
              if (track.length > 0) {
                configuredSounds.push({
                  id: track[0].id.toString(),
                  name: track[0].name,
                  icon: section === 'ambient' ? '🎵' : '🔊',
                  url: track[0].url,
                  source: 'uploaded'
                });
              }
            }
          }

          res.status(200).json({
            success: true,
            section: section,
            sounds: configuredSounds,
            isDefault: false
          });
        }
      } else {
        // Get all sections configuration
        const ambientConfig = await sql`
          SELECT sound_id, sound_source, display_order
          FROM user_section_config 
          WHERE user_id = ${payload.userId} AND section_type = 'ambient'
          ORDER BY display_order
        `;

        const effectConfig = await sql`
          SELECT sound_id, sound_source, display_order
          FROM user_section_config 
          WHERE user_id = ${payload.userId} AND section_type = 'effect'
          ORDER BY display_order
        `;

        res.status(200).json({
          success: true,
          sections: {
            ambient: ambientConfig.length > 0 ? 'configured' : 'default',
            effect: effectConfig.length > 0 ? 'configured' : 'default'
          },
          defaults: DEFAULT_SOUNDS
        });
      }

    } else if (req.method === 'POST') {
      // Save section configuration
      const { sectionType, sounds } = req.body;

      if (!sectionType || !['ambient', 'effect'].includes(sectionType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid section type',
        });
        return;
      }

      if (!Array.isArray(sounds)) {
        res.status(400).json({
          success: false,
          message: 'Sounds must be an array',
        });
        return;
      }

      // Delete existing configuration for this section
      await sql`
        DELETE FROM user_section_config 
        WHERE user_id = ${payload.userId} AND section_type = ${sectionType}
      `;

      // Insert new configuration
      for (let i = 0; i < sounds.length; i++) {
        const sound = sounds[i];
        await sql`
          INSERT INTO user_section_config (user_id, section_type, sound_id, sound_source, display_order)
          VALUES (${payload.userId}, ${sectionType}, ${sound.id}, ${sound.source}, ${i})
        `;
      }

      res.status(200).json({
        success: true,
        message: `${sectionType} section configuration saved`,
        section: sectionType,
        soundCount: sounds.length
      });

    } else if (req.method === 'DELETE') {
      // Reset section to default
      if (!section || !['ambient', 'effect'].includes(section)) {
        res.status(400).json({
          success: false,
          message: 'Invalid section type',
        });
        return;
      }

      await sql`
        DELETE FROM user_section_config 
        WHERE user_id = ${payload.userId} AND section_type = ${section}
      `;

      res.status(200).json({
        success: true,
        message: `${section} section reset to default`,
        section: section,
        defaultSounds: DEFAULT_SOUNDS[section]
      });

    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
    }

  } catch (error) {
    console.error('Sections API error:', error);
    res.status(500).json({
      success: false,
      message: 'Database operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};