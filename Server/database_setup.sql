-- MySQL Database Setup Script for Fintech Application
-- Run this script in your MySQL client (phpMyAdmin, MySQL Workbench, etc.)

-- Create database
CREATE DATABASE IF NOT EXISTS fintech_db;
USE fintech_db;

-- Note: Tables will be automatically created by Sequelize when you start the server
-- The following is just for reference of what will be created:

/*
Tables that will be created by Sequelize:

1. users - User accounts with roles (admin, distributor, retailer, customer)
2. transactions - All financial transactions
3. beneficiaries - Saved beneficiary accounts for transfers

Sequelize will automatically handle:
- Table creation with proper column types
- Foreign key relationships
- Indexes for performance
- Auto-increment primary keys
- Timestamps (createdAt, updatedAt)
*/

-- Create an admin user (you can run this after tables are created)
-- Password will be hashed when inserted through the application
-- INSERT INTO users (username, email, phone, fullName, password, role, isActive, kycStatus, walletBalance) 
-- VALUES ('admin', 'admin@fintech.com', '9999999999', 'System Admin', '$hashed_password', 'admin', true, 'approved', 10000.00);

SELECT 'Database fintech_db created successfully!' as message;