-- Simplified migration to just run the data type changes without foreign key constraints
-- We'll handle foreign keys in the application layer for now

-- First, we need to drop all foreign key constraints that reference users.id
ALTER TABLE credit_cards DROP CONSTRAINT IF EXISTS credit_cards_user_id_users_id_fk;
ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_user_id_users_id_fk;
ALTER TABLE monthly_payments DROP CONSTRAINT IF EXISTS monthly_payments_user_id_users_id_fk;
ALTER TABLE income DROP CONSTRAINT IF EXISTS income_user_id_users_id_fk;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_users_id_fk;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_user_id_users_id_fk;
ALTER TABLE savings_goals DROP CONSTRAINT IF EXISTS savings_goals_user_id_users_id_fk;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_id_users_id_fk;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_user_id_users_id_fk;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_user_id_users_id_fk;
ALTER TABLE liabilities DROP CONSTRAINT IF EXISTS liabilities_user_id_users_id_fk;
ALTER TABLE net_worth_snapshots DROP CONSTRAINT IF EXISTS net_worth_snapshots_user_id_users_id_fk;
ALTER TABLE business_profiles DROP CONSTRAINT IF EXISTS business_profiles_user_id_users_id_fk;
ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_user_id_users_id_fk;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_user_id_users_id_fk;
ALTER TABLE business_credit_cards DROP CONSTRAINT IF EXISTS business_credit_cards_user_id_users_id_fk;
ALTER TABLE business_loans DROP CONSTRAINT IF EXISTS business_loans_user_id_users_id_fk;
ALTER TABLE business_revenue DROP CONSTRAINT IF EXISTS business_revenue_user_id_users_id_fk;
ALTER TABLE business_expenses DROP CONSTRAINT IF EXISTS business_expenses_user_id_users_id_fk;

-- Update the users table primary key to VARCHAR
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255);

-- Update all user_id foreign key columns to VARCHAR(255)
ALTER TABLE credit_cards ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE loans ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE monthly_payments ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE income ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE payments ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE expenses ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE savings_goals ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE budgets ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE investments ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE assets ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE liabilities ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE net_worth_snapshots ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE business_profiles ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE vendors ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE purchase_orders ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE business_credit_cards ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE business_loans ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE business_revenue ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE business_expenses ALTER COLUMN user_id TYPE VARCHAR(255);

-- Note: Foreign key constraints are removed for Clerk integration
-- The application will handle referential integrity
