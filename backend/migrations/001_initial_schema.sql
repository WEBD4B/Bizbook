-- Initial migration for BizBook Financial Management System
-- This creates all the necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit Cards table
CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_name VARCHAR(255) NOT NULL,
    last_four_digits VARCHAR(4),
    credit_limit NUMERIC(12, 2),
    balance NUMERIC(12, 2) DEFAULT 0,
    interest_rate NUMERIC(5, 2),
    minimum_payment NUMERIC(10, 2),
    due_date DATE,
    statement_balance NUMERIC(12, 2),
    available_credit NUMERIC(12, 2),
    rewards_program VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    loan_name VARCHAR(255) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    original_amount NUMERIC(12, 2),
    current_balance NUMERIC(12, 2) NOT NULL,
    interest_rate NUMERIC(5, 2),
    monthly_payment NUMERIC(10, 2),
    minimum_payment NUMERIC(10, 2),
    due_date DATE,
    lender VARCHAR(255),
    term_length INTEGER,
    remaining_term INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly Payments table
CREATE TABLE IF NOT EXISTS monthly_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    payment_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE,
    is_recurring BOOLEAN DEFAULT true,
    frequency VARCHAR(20) DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Income table
CREATE TABLE IF NOT EXISTS income (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    income_type VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    next_pay_date DATE,
    is_active BOOLEAN DEFAULT true,
    taxable BOOLEAN DEFAULT true,
    category VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    confirmation_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50),
    merchant VARCHAR(255),
    is_recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(20),
    tax_deductible BOOLEAN DEFAULT false,
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Savings Goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0,
    monthly_contribution NUMERIC(10, 2) DEFAULT 0,
    target_date DATE,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    budget_amount NUMERIC(10, 2) NOT NULL,
    current_spent NUMERIC(10, 2) DEFAULT 0,
    period VARCHAR(20) DEFAULT 'monthly',
    start_date DATE,
    end_date DATE,
    alert_threshold NUMERIC(5, 2) DEFAULT 80,
    is_active BOOLEAN DEFAULT true,
    rollover BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    institution VARCHAR(255),
    current_value NUMERIC(15, 2) NOT NULL,
    contribution_amount NUMERIC(10, 2) DEFAULT 0,
    contribution_frequency VARCHAR(20) DEFAULT 'monthly',
    employer_match NUMERIC(5, 2) DEFAULT 0,
    vesting_schedule VARCHAR(255),
    risk_level VARCHAR(20) DEFAULT 'moderate',
    expected_return NUMERIC(5, 2) DEFAULT 7,
    maturity_date DATE,
    auto_rebalance BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    current_value NUMERIC(15, 2) NOT NULL,
    purchase_price NUMERIC(15, 2),
    purchase_date DATE,
    appreciation_rate NUMERIC(5, 2) DEFAULT 0,
    depreciation_rate NUMERIC(5, 2) DEFAULT 0,
    ownership_percentage NUMERIC(5, 2) DEFAULT 100,
    is_liquid BOOLEAN DEFAULT false,
    institution VARCHAR(255),
    account_number VARCHAR(100),
    maturity_date DATE,
    expected_return NUMERIC(5, 2),
    risk_level VARCHAR(20),
    market_value NUMERIC(15, 2),
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Liabilities table
CREATE TABLE IF NOT EXISTS liabilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    liability_name VARCHAR(255) NOT NULL,
    liability_type VARCHAR(50) NOT NULL,
    current_balance NUMERIC(15, 2) NOT NULL,
    original_amount NUMERIC(15, 2),
    interest_rate NUMERIC(5, 2),
    minimum_payment NUMERIC(10, 2),
    monthly_payment NUMERIC(10, 2),
    due_date DATE,
    payment_frequency VARCHAR(20) DEFAULT 'monthly',
    lender VARCHAR(255),
    account_number VARCHAR(100),
    loan_term INTEGER,
    remaining_term INTEGER,
    payoff_strategy VARCHAR(50),
    is_secured BOOLEAN DEFAULT false,
    collateral TEXT,
    tax_deductible BOOLEAN DEFAULT false,
    credit_limit NUMERIC(12, 2),
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Net Worth Snapshots table
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_assets NUMERIC(15, 2) NOT NULL,
    total_liabilities NUMERIC(15, 2) NOT NULL,
    net_worth NUMERIC(15, 2) NOT NULL,
    cash_liquid_assets NUMERIC(15, 2) DEFAULT 0,
    investment_assets NUMERIC(15, 2) DEFAULT 0,
    real_estate_assets NUMERIC(15, 2) DEFAULT 0,
    vehicle_assets NUMERIC(15, 2) DEFAULT 0,
    personal_property_assets NUMERIC(15, 2) DEFAULT 0,
    business_assets NUMERIC(15, 2) DEFAULT 0,
    consumer_debt NUMERIC(15, 2) DEFAULT 0,
    vehicle_loans NUMERIC(15, 2) DEFAULT 0,
    real_estate_debt NUMERIC(15, 2) DEFAULT 0,
    education_debt NUMERIC(15, 2) DEFAULT 0,
    business_debt NUMERIC(15, 2) DEFAULT 0,
    taxes_bills NUMERIC(15, 2) DEFAULT 0,
    month_over_month_change NUMERIC(5, 2),
    year_over_year_change NUMERIC(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    ein VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    vendor_type VARCHAR(100),
    payment_terms VARCHAR(100),
    tax_id VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    ship_to_address TEXT,
    bill_to_address TEXT,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    shipping_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    terms VARCHAR(100),
    notes TEXT,
    requisitioner VARCHAR(255),
    approved_by VARCHAR(255),
    approval_date DATE,
    received_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    unit_of_measure VARCHAR(20) DEFAULT 'each',
    part_number VARCHAR(100),
    received_quantity NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Credit Cards table
CREATE TABLE IF NOT EXISTS business_credit_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    card_name VARCHAR(255) NOT NULL,
    last_four_digits VARCHAR(4),
    credit_limit NUMERIC(12, 2),
    balance NUMERIC(12, 2) DEFAULT 0,
    interest_rate NUMERIC(5, 2),
    minimum_payment NUMERIC(10, 2),
    due_date DATE,
    statement_balance NUMERIC(12, 2),
    available_credit NUMERIC(12, 2),
    rewards_program VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Loans table
CREATE TABLE IF NOT EXISTS business_loans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    loan_name VARCHAR(255) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    original_amount NUMERIC(12, 2),
    current_balance NUMERIC(12, 2) NOT NULL,
    interest_rate NUMERIC(5, 2),
    monthly_payment NUMERIC(10, 2),
    minimum_payment NUMERIC(10, 2),
    due_date DATE,
    lender VARCHAR(255),
    term_length INTEGER,
    remaining_term INTEGER,
    purpose VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Revenue table
CREATE TABLE IF NOT EXISTS business_revenue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    revenue_date DATE NOT NULL,
    category VARCHAR(100),
    taxable BOOLEAN DEFAULT true,
    invoice_number VARCHAR(100),
    customer_id VARCHAR(100),
    payment_method VARCHAR(50),
    is_recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Expenses table
CREATE TABLE IF NOT EXISTS business_expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50),
    vendor VARCHAR(255),
    is_recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(20),
    tax_deductible BOOLEAN DEFAULT true,
    receipt_url TEXT,
    notes TEXT,
    invoice_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_user_id ON monthly_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user_id ON net_worth_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_date ON net_worth_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_business_id ON purchase_orders(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_business_credit_cards_user_id ON business_credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_business_loans_user_id ON business_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_business_revenue_user_id ON business_revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_business_expenses_user_id ON business_expenses(user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_payments_updated_at BEFORE UPDATE ON monthly_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_credit_cards_updated_at BEFORE UPDATE ON business_credit_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_loans_updated_at BEFORE UPDATE ON business_loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_revenue_updated_at BEFORE UPDATE ON business_revenue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_expenses_updated_at BEFORE UPDATE ON business_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
