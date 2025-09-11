-- Add Wallet Enhancement Fields to Users Table
-- Run this in your MySQL client (phpMyAdmin, MySQL Workbench, etc.)

USE fintech_db;

-- Add new wallet fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wallet_daily_limit DECIMAL(15, 2) DEFAULT 50000.00,
ADD COLUMN IF NOT EXISTS wallet_monthly_limit DECIMAL(15, 2) DEFAULT 1000000.00,
ADD COLUMN IF NOT EXISTS daily_spent DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS monthly_spent DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_transaction_date TIMESTAMP NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_last_transaction ON users(last_transaction_date);
CREATE INDEX IF NOT EXISTS idx_users_daily_spent ON users(daily_spent);
CREATE INDEX IF NOT EXISTS idx_users_monthly_spent ON users(monthly_spent);

-- Verify the new columns were added
DESCRIBE users;

SELECT 'Wallet enhancement fields added successfully!' as message;