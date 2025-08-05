// Consolidated environments endpoints
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

async function initEnvironmentsTable() {
  try {
    // First check what type the users.id column is
    const userTableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `;
    
    console.log('Users table id column info:', userTableInfo);
    
    // Create environments table with correct user_id type
    await sql`
      CREATE TABLE IF NOT EXISTS user_environments (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        combat_track_id INTEGER NULL,
        exploration_track_id INTEGER NULL,
        sneak_track_id INTEGER NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add foreign key constraints separately to handle existing data
    try {
      await sql`
        ALTER TABLE user_environments 
        ADD CONSTRAINT IF NOT EXISTS user_environments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `;
    } catch (fkError) {
      console.log('Foreign key constraint already exists or error:', fkError.message);
    }

    try {
      await sql`
        ALTER TABLE user_environments 
        ADD CONSTRAINT IF NOT EXISTS user_environments_combat_track_fkey 
        FOREIGN KEY (combat_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL
      `;
    } catch (fkError) {
      console.log('Combat track foreign key constraint issue:', fkError.message);
    }

    try {
      await sql`
        ALTER TABLE user_environments 
        ADD CONSTRAINT IF NOT EXISTS user_environments_exploration_track_fkey 
        FOREIGN KEY (exploration_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL
      `;
    } catch (fkError) {
      console.log('Exploration track foreign key constraint issue:', fkError.message);
    }

    try {
      await sql`
        ALTER TABLE user_environments 
        ADD CONSTRAINT IF NOT EXISTS user_environments_sneak_track_fkey 
        FOREIGN KEY (sneak_track_id) REFERENCES user_tracks(id) ON DELETE SET NULL
      `;
    } catch (fkError) {
      console.log('Sneak track foreign key constraint issue:', fkError.message);
    }

    console.log('✅ user_environments table initialized');
  } catch (error) {
    console.error('❌ Error initializing user_environments table:', error);
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

    await initEnvironmentsTable();

    const { id } = req.query;

    if (req.method === 'POST' && !id) {
      // Create environment
      const { name, combatTrackId, explorationTrackId, sneakTrackId } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Environment name is required',
        });
        return;
      }

      const result = await sql`
        INSERT INTO user_environments (user_id, name, combat_track_id, exploration_track_id, sneak_track_id)
        VALUES (${payload.userId}, ${name.trim()}, ${combatTrackId || null}, ${explorationTrackId || null}, ${sneakTrackId || null})
        RETURNING *
      `;

      if (result.length === 0) {
        res.status(500).json({
          success: false,
          message: 'Failed to create environment',
        });
        return;
      }

      const environment = result[0];

      // Get track details if any are assigned
      let environmentWithTracks = environment;
      if (combatTrackId || explorationTrackId || sneakTrackId) {
        const trackIds = [combatTrackId, explorationTrackId, sneakTrackId].filter(Boolean);
        const tracks = await sql`
          SELECT id, name, url, type 
          FROM user_tracks 
          WHERE id = ANY(${trackIds}) AND user_id = ${payload.userId}
        `;

        const trackMap = tracks.reduce((acc, track) => {
          acc[track.id] = track;
          return acc;
        }, {});

        environmentWithTracks = {
          ...environment,
          combat_track: combatTrackId ? trackMap[combatTrackId] : null,
          exploration_track: explorationTrackId ? trackMap[explorationTrackId] : null,
          sneak_track: sneakTrackId ? trackMap[sneakTrackId] : null,
        };
      }

      res.status(200).json({
        success: true,
        message: 'Environment created successfully',
        environment: environmentWithTracks,
      });

    } else if (req.method === 'GET' && !id) {
      // List environments
      const environments = await sql`
        SELECT 
          e.*,
          ct.name as combat_track_name,
          ct.url as combat_track_url,
          ct.id as combat_track_id,
          et.name as exploration_track_name,
          et.url as exploration_track_url,
          et.id as exploration_track_id,
          st.name as sneak_track_name,
          st.url as sneak_track_url,
          st.id as sneak_track_id
        FROM user_environments e
        LEFT JOIN user_tracks ct ON e.combat_track_id = ct.id
        LEFT JOIN user_tracks et ON e.exploration_track_id = et.id
        LEFT JOIN user_tracks st ON e.sneak_track_id = st.id
        WHERE e.user_id = ${payload.userId}
        ORDER BY e.created_at DESC
      `;

      // Transform to match frontend structure
      const transformedEnvironments = environments.map(env => ({
        id: env.id,
        name: env.name,
        created_at: env.created_at,
        updated_at: env.updated_at,
        tracks: {
          combat: env.combat_track_id ? {
            id: env.combat_track_id,
            name: env.combat_track_name,
            url: env.combat_track_url
          } : null,
          exploration: env.exploration_track_id ? {
            id: env.exploration_track_id,
            name: env.exploration_track_name,
            url: env.exploration_track_url
          } : null,
          sneak: env.sneak_track_id ? {
            id: env.sneak_track_id,
            name: env.sneak_track_name,
            url: env.sneak_track_url
          } : null
        }
      }));

      res.status(200).json({
        success: true,
        environments: transformedEnvironments,
      });

    } else if (id) {
      // Environment-specific operations
      const environmentId = parseInt(id);
      
      if (isNaN(environmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid environment ID',
        });
        return;
      }

      // Verify environment belongs to user
      const existing = await sql`
        SELECT id FROM user_environments 
        WHERE id = ${environmentId} AND user_id = ${payload.userId}
      `;

      if (existing.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Environment not found',
        });
        return;
      }

      if (req.method === 'DELETE') {
        // Delete environment
        await sql`
          DELETE FROM user_environments 
          WHERE id = ${environmentId} AND user_id = ${payload.userId}
        `;

        res.status(200).json({
          success: true,
          message: 'Environment deleted successfully',
        });

      } else if (req.method === 'PUT') {
        // Update environment
        const { name, combatTrackId, explorationTrackId, sneakTrackId } = req.body;

        if (!name || !name.trim()) {
          res.status(400).json({
            success: false,
            message: 'Environment name is required',
          });
          return;
        }

        // Verify track IDs belong to user if provided
        const trackIds = [combatTrackId, explorationTrackId, sneakTrackId].filter(Boolean);
        if (trackIds.length > 0) {
          const userTracks = await sql`
            SELECT id FROM user_tracks 
            WHERE id = ANY(${trackIds}) AND user_id = ${payload.userId}
          `;
          
          const validTrackIds = userTracks.map(t => t.id);
          const invalidIds = trackIds.filter(id => !validTrackIds.includes(id));
          
          if (invalidIds.length > 0) {
            res.status(400).json({
              success: false,
              message: 'Some track IDs are invalid or do not belong to you',
            });
            return;
          }
        }

        const result = await sql`
          UPDATE user_environments 
          SET 
            name = ${name.trim()},
            combat_track_id = ${combatTrackId || null},
            exploration_track_id = ${explorationTrackId || null},
            sneak_track_id = ${sneakTrackId || null},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${environmentId} AND user_id = ${payload.userId}
          RETURNING *
        `;

        if (result.length === 0) {
          res.status(500).json({
            success: false,
            message: 'Failed to update environment',
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: 'Environment updated successfully',
          environment: result[0],
        });

      } else {
        res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
      }

    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
    }

  } catch (error) {
    console.error('Environments API error:', error);
    res.status(500).json({
      success: false,
      message: 'Database operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};