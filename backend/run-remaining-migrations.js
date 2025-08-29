import postgres from 'postgres';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();
const sql = postgres(process.env.DATABASE_URL);

async function runRemainingMigrations() {
  try {
    const migrations = [
      '002_update_user_id_to_varchar_simple.sql',
      '002_add_expense_payment_fields.sql',
      '003_add_payment_status.sql'
    ];

    console.log('🔄 Running remaining migrations...');

    for (const migration of migrations) {
      console.log(`📝 Running migration: ${migration}`);
      const migrationPath = path.join('./migrations', migration);
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        await sql.unsafe(migrationSQL);
        console.log(`✅ Migration completed: ${migration}`);
      } else {
        console.log(`⚠️  Migration file not found: ${migration}`);
      }
    }
    console.log('🎉 All remaining migrations completed!');
    console.log('🗄️  Database is now ready for Clerk user IDs');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await sql.end();
  }
}

runRemainingMigrations();
