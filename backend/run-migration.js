import postgres from 'postgres';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    // List of migrations to run in order
    const migrations = [
      '001_initial_schema.sql',
      '002_update_user_id_to_varchar_simple.sql',
      '002_add_expense_payment_fields.sql',
      '003_add_payment_status.sql'
    ];

    console.log('🔄 Running database migrations...');
    
    for (const migration of migrations) {
      console.log(`📝 Running migration: ${migration}`);
      
      // Read the migration file
      const migrationPath = path.join('./migrations', migration);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration file not found: ${migration}, skipping...`);
        continue;
      }
      
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute the migration
      await sql.unsafe(migrationSQL);
      
      console.log(`✅ Migration completed: ${migration}`);
    }
    
    console.log('🎉 All migrations completed successfully!');
    console.log('�️  Database schema is now up to date');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await sql.end();
  }
}

runMigration();
