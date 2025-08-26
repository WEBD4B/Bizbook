import postgres from 'postgres';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🔄 Running user_id VARCHAR migration...');
    
    // Read the migration file
    const migrationPath = path.join('./migrations', '002_update_user_id_to_varchar.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 User ID columns have been updated to support Clerk user IDs');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await sql.end();
  }
}

runMigration();
