export const AccountSchema = {
    tableName: 'accounts',
    schema: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        user_id: 'INT NOT NULL',
        account_number: 'VARCHAR(20) UNIQUE NOT NULL',
        account_type: 'ENUM("savings", "current", "business", "premium") DEFAULT "savings"',
        balance: 'DECIMAL(15, 2) DEFAULT 0.00',
        available_balance: 'DECIMAL(15, 2) DEFAULT 0.00',
        status: 'ENUM("active", "inactive", "blocked", "frozen") DEFAULT "active"',
        
        // Banking features
        overdraft_limit: 'DECIMAL(15, 2) DEFAULT 0.00',
        daily_limit: 'DECIMAL(15, 2) DEFAULT 50000.00',
        monthly_limit: 'DECIMAL(15, 2) DEFAULT 1000000.00',
        total_daily_used: 'DECIMAL(15, 2) DEFAULT 0.00',
        total_monthly_used: 'DECIMAL(15, 2) DEFAULT 0.00',
        
        // Account details
        branch_code: 'VARCHAR(10) NULL',
        ifsc_code: 'VARCHAR(11) NULL',
        account_holder_name: 'VARCHAR(100) NULL',
        bank_name: 'VARCHAR(100) NULL',
        
        // Metadata
        account_metadata: 'TEXT NULL',
        
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    },
    foreignKeys: [
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
    ]
};