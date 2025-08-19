import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

// Database connection configuration
const connectionConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections in pool
  idle_timeout: 20000, // Close connections after 20 seconds of inactivity
  connect_timeout: 10000, // Timeout when connecting to database
};

// Create PostgreSQL connection using session pooler
const sql = postgres(process.env.DATABASE_URL, {
  ssl: connectionConfig.ssl,
  max: connectionConfig.max,
  idle_timeout: connectionConfig.idle_timeout,
  connect_timeout: connectionConfig.connect_timeout,
  prepare: false, // Required for session pooler compatibility
});

// Create Drizzle database instance
export const db = drizzle(sql);

// Test database connection
export async function testConnection() {
  try {
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection() {
  try {
    await sql.end();
    console.log('📦 Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
}

// Handle process termination
process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);

export default db;
