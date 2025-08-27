-- Migration to add payment status tracking
-- This allows tracking payment status (pending, paid, failed, cancelled) and paid date

-- Add new columns to payments table
ALTER TABLE payments ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN paid_date TIMESTAMP;
ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Add index for better query performance on status
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_account_status ON payments(account_id, status);

-- Update existing payment records to have 'paid' status (since they were already recorded)
UPDATE payments SET status = 'paid', paid_date = created_at WHERE status = 'pending';
