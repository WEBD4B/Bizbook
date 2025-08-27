import postgres from 'postgres';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🔄 Running payment status migration...');
    
    // Read the migration file
    const migrationPath = path.join('./migrations', '003_add_payment_status.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Payment status migration completed successfully!');
    console.log('📊 Payment table now supports status tracking');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await sql.end();
  }
}

runMigration();
