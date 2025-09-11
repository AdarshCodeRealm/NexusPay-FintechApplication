export const UserSchema = {
    tableName: 'users',
    schema: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        username: 'VARCHAR(50) UNIQUE NOT NULL',
        email: 'VARCHAR(100) UNIQUE NOT NULL',
        password: 'VARCHAR(255) NOT NULL',
        
        // Profile fields
        full_name: 'VARCHAR(100) NULL',
        phone: 'VARCHAR(15) NULL',
        age: 'INT NULL',
        date_of_birth: 'DATE NULL',
        gender: 'ENUM("male", "female", "other") NULL',
        address: 'TEXT NULL',
        city: 'VARCHAR(50) NULL',
        state: 'VARCHAR(50) NULL',
        country: 'VARCHAR(50) DEFAULT "India"',
        pincode: 'VARCHAR(10) NULL',
        
        // Account fields
        avatar: 'VARCHAR(255) NULL',
        is_verified: 'BOOLEAN DEFAULT FALSE',
        email_verified: 'BOOLEAN DEFAULT FALSE',
        phone_verified: 'BOOLEAN DEFAULT FALSE',
        kyc_status: 'ENUM("pending", "approved", "rejected") DEFAULT "pending"',
        account_status: 'ENUM("active", "inactive", "suspended") DEFAULT "active"',
        
        // Security fields
        last_login: 'TIMESTAMP NULL',
        login_attempts: 'INT DEFAULT 0',
        is_locked: 'BOOLEAN DEFAULT FALSE',
        locked_until: 'TIMESTAMP NULL',
        refresh_token: 'TEXT NULL',
        
        // Banking details
        pan_number: 'VARCHAR(10) NULL',
        aadhar_number: 'VARCHAR(12) NULL',
        
        // Preferences & Settings
        preferences: 'TEXT NULL',
        notification_settings: 'TEXT NULL',
        language: 'VARCHAR(10) DEFAULT "en"',
        currency: 'VARCHAR(3) DEFAULT "INR"',
        
        // Wallet fields
        wallet_balance: 'DECIMAL(15, 2) DEFAULT 0.00',
        wallet_frozen_balance: 'DECIMAL(15, 2) DEFAULT 0.00',
        wallet_daily_limit: 'DECIMAL(15, 2) DEFAULT 50000.00',
        wallet_monthly_limit: 'DECIMAL(15, 2) DEFAULT 1000000.00',
        daily_spent: 'DECIMAL(15, 2) DEFAULT 0.00',
        monthly_spent: 'DECIMAL(15, 2) DEFAULT 0.00',
        last_transaction_date: 'TIMESTAMP NULL',
        
        // Role and business info
        role: 'ENUM("user", "retailer", "distributor", "admin") DEFAULT "user"',
        business_info: 'TEXT NULL',
        commission_rate: 'DECIMAL(5, 2) DEFAULT 0.00',
        kyc_documents: 'TEXT NULL',
        
        // OTP fields
        otp_code: 'VARCHAR(6) NULL',
        otp_expiry: 'TIMESTAMP NULL',
        
        // Status
        is_active: 'BOOLEAN DEFAULT TRUE',
        
        // Timestamps
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
};