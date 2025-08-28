import postgres from 'postgres';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🔄 Running expense payment fields migration...');
    
    // Read the migration file
    const migrationPath = path.join('./migrations', '002_add_expense_payment_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Expense payment fields migration completed successfully!');
    console.log('📊 Expense table now supports payment type and income tracking');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await sql.end();
  }
}

runMigration();
