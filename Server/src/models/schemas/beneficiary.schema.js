export const BeneficiarySchema = {
    tableName: 'beneficiaries',
    schema: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        user_id: 'INT NOT NULL',
        beneficiary_name: 'VARCHAR(100) NOT NULL',
        account_number: 'VARCHAR(100) NOT NULL',
        ifsc_code: 'VARCHAR(11) NOT NULL',
        bank_name: 'VARCHAR(100) NOT NULL',
        
        // Additional details
        nickname: 'VARCHAR(50) NULL',
        beneficiary_type: 'ENUM("individual", "business") DEFAULT "individual"',
        account_type: 'ENUM("savings", "current", "nri") DEFAULT "savings"',
        
        // Verification status
        is_verified: 'BOOLEAN DEFAULT FALSE',
        verification_status: 'ENUM("pending", "verified", "failed") DEFAULT "pending"',
        verification_date: 'TIMESTAMP NULL',
        
        // Status
        is_active: 'BOOLEAN DEFAULT TRUE',
        is_favorite: 'BOOLEAN DEFAULT FALSE',
        
        // Metadata
        beneficiary_metadata: 'TEXT NULL',
        last_transaction_date: 'TIMESTAMP NULL',
        total_transactions: 'INT DEFAULT 0',
        total_amount_sent: 'DECIMAL(15, 2) DEFAULT 0.00',
        
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    },
    foreignKeys: [
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
    ]
};