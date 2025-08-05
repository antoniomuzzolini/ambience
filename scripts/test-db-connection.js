// Test script to verify Neon DB connection
// Run with: node scripts/test-db-connection.js

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL);

async function testConnection() {
  try {
    console.log('Testing Neon DB connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!');
    console.log('Current time from DB:', result[0].current_time);
    
    // Check if users table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    
    if (tables.length > 0) {
      console.log('✅ Users table exists');
      
      // Count users
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`📊 Total users: ${userCount[0].count}`);
    } else {
      console.log('⚠️  Users table does not exist yet - will be created on first use');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();