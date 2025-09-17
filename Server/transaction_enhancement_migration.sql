-- Enhanced Transaction Table Migration
-- Add new fields for comprehensive transaction ledger
-- Run this migration to add missing fields to the transactions table

-- Add new columns to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS ledger_date DATE NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_code VARCHAR(50) NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS ledger_type ENUM('TopIn', 'Fund Transfer Transaction', 'Wallet Topup', 'Payment', 'Commission', 'Cashback', 'Refund') NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS remarks TEXT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS debit_amount DECIMAL(15, 2) NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS credit_amount DECIMAL(15, 2) NULL;

-- Add indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_transactions_ledger_date ON transactions(ledger_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_code ON transactions(user_code);
CREATE INDEX IF NOT EXISTS idx_transactions_ledger_type ON transactions(ledger_type);

-- Update existing transactions to populate new fields where possible
UPDATE transactions SET 
    ledger_date = DATE(created_at),
    user_code = CONCAT('CSP', user_id),
    debit_amount = CASE WHEN amount < 0 THEN ABS(amount) ELSE NULL END,
    credit_amount = CASE WHEN amount > 0 THEN amount ELSE NULL END,
    ledger_type = CASE 
        WHEN transaction_type = 'deposit' THEN 'TopIn'
        WHEN transaction_type = 'transfer' THEN 'Fund Transfer Transaction' 
        WHEN transaction_type = 'withdrawal' THEN 'Wallet Topup'
        WHEN transaction_type = 'payment' THEN 'Payment'
        WHEN transaction_type = 'commission' THEN 'Commission'
        WHEN transaction_type = 'refund' THEN 'Refund'
        ELSE 'Payment'
    END,
    remarks = CASE 
        WHEN transaction_type = 'deposit' THEN CONCAT('TopIn via Payment Gateway - ₹', ABS(amount))
        WHEN transaction_type = 'transfer' THEN CONCAT('Fund Transfer - ₹', ABS(amount))
        WHEN transaction_type = 'withdrawal' THEN CONCAT('Wallet Withdrawal - ₹', ABS(amount))
        ELSE CONCAT('Transaction - ₹', ABS(amount))
    END
WHERE ledger_date IS NULL;