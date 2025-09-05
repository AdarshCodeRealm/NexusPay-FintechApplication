export const TransactionSchema = {
    tableName: 'transactions',
    schema: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        from_account_id: 'INT NULL',
        to_account_id: 'INT NULL',
        user_id: 'INT NOT NULL',
        transaction_type: 'ENUM("transfer", "deposit", "withdrawal", "payment", "refund", "fee", "commission") NOT NULL',
        amount: 'DECIMAL(15, 2) NOT NULL',
        fee_amount: 'DECIMAL(10, 2) DEFAULT 0.00',
        currency: 'VARCHAR(3) DEFAULT "INR"',
        
        // Transaction details
        description: 'TEXT NULL',
        reference_number: 'VARCHAR(100) UNIQUE NOT NULL',
        bank_reference: 'VARCHAR(100) NULL',
        utr_number: 'VARCHAR(22) NULL',
        payment_method: 'VARCHAR(50) NULL',
        
        // Status tracking
        status: 'ENUM("pending", "processing", "completed", "failed", "cancelled", "refunded") DEFAULT "pending"',
        failure_reason: 'TEXT NULL',
        processed_at: 'TIMESTAMP NULL',
        
        // Beneficiary details
        beneficiary_name: 'VARCHAR(100) NULL',
        beneficiary_account: 'VARCHAR(100) NULL',
        beneficiary_ifsc: 'VARCHAR(11) NULL',
        beneficiary_bank: 'VARCHAR(100) NULL',
        
        // Balance tracking
        opening_balance: 'DECIMAL(15, 2) NULL',
        closing_balance: 'DECIMAL(15, 2) NULL',
        
        // Metadata
        transaction_metadata: 'TEXT NULL',
        ip_address: 'VARCHAR(45) NULL',
        device_info: 'VARCHAR(255) NULL',
        location: 'VARCHAR(255) NULL',
        
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    },
    foreignKeys: [
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'FOREIGN KEY (from_account_id) REFERENCES accounts(id)',
        'FOREIGN KEY (to_account_id) REFERENCES accounts(id)'
    ]
};