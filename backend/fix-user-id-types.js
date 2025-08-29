import postgres from 'postgres';
import { config } from 'dotenv';

config();
const sql = postgres(process.env.DATABASE_URL);

async function fixUserIdTypes() {
  try {
    console.log('🔧 Fixing user_id column types for Clerk integration...');

    // First, let's check if there are any existing foreign key constraints and drop them
    console.log('📝 Step 1: Dropping all foreign key constraints...');
    
    const constraints = await sql`
      SELECT conname, conrelid::regclass as table_name
      FROM pg_constraint 
      WHERE contype = 'f' 
      AND confrelid = 'users'::regclass;
    `;

    for (const constraint of constraints) {
      console.log(`   Dropping constraint: ${constraint.conname} from ${constraint.table_name}`);
      await sql.unsafe(`ALTER TABLE ${constraint.table_name} DROP CONSTRAINT IF EXISTS ${constraint.conname}`);
    }

    console.log('📝 Step 2: Converting users.id to VARCHAR...');
    await sql`ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255)`;

    console.log('📝 Step 3: Converting all user_id columns to VARCHAR...');
    const tables = [
      'credit_cards', 'loans', 'monthly_payments', 'income', 'payments', 
      'expenses', 'savings_goals', 'budgets', 'investments', 'assets', 
      'liabilities', 'net_worth_snapshots', 'business_profiles', 'vendors', 
      'purchase_orders', 'business_credit_cards', 'business_loans', 
      'business_revenue', 'business_expenses'
    ];

    for (const table of tables) {
      console.log(`   Converting ${table}.user_id to VARCHAR(255)...`);
      await sql.unsafe(`ALTER TABLE ${table} ALTER COLUMN user_id TYPE VARCHAR(255)`);
    }

    console.log('✅ All user_id columns successfully converted to VARCHAR(255)');
    console.log('🔄 Database is now ready for Clerk user IDs');
    console.log('📝 Note: Foreign key constraints removed for Clerk integration');

  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await sql.end();
  }
}

fixUserIdTypes();
