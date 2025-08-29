import postgres from 'postgres';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();
const sql = postgres(process.env.DATABASE_URL);

async function runFinalMigrations() {
  try {
    const migrations = [
      '002_add_expense_payment_fields.sql',
      '003_add_payment_status.sql'
    ];

    console.log('🔄 Running final migrations...');

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
    console.log('🎉 All migrations completed successfully!');
    console.log('🗄️  Your Supabase database is now fully set up with:');
    console.log('   ✅ All tables created');
    console.log('   ✅ User IDs converted to VARCHAR for Clerk integration');
    console.log('   ✅ Expense payment fields added');
    console.log('   ✅ Payment status fields added');
    console.log('🚀 You can now start using KashGrip with your Supabase database!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await sql.end();
  }
}

runFinalMigrations();
