-- Migration to add payment type and income account tracking to expenses
-- This migration adds fields to track which income account was used for payment
-- and whether the expense is a subscription or one-time payment

ALTER TABLE expenses 
ADD COLUMN payment_type VARCHAR(20) CHECK (payment_type IN ('subscription', 'one-time')),
ADD COLUMN paid_from_income_id UUID REFERENCES income(id) ON DELETE SET NULL,
ADD COLUMN paid_from_income VARCHAR(255);

-- Add index for better performance when filtering by payment type
CREATE INDEX IF NOT EXISTS idx_expenses_payment_type ON expenses(payment_type);

-- Add index for income relationships
CREATE INDEX IF NOT EXISTS idx_expenses_paid_from_income_id ON expenses(paid_from_income_id);

-- Update existing expenses to have default payment type if they're recurring
UPDATE expenses 
SET payment_type = CASE 
    WHEN is_recurring = true THEN 'subscription'
    ELSE 'one-time'
END
WHERE payment_type IS NULL;
