export const PaymentSchema = {
    tableName: 'payments',
    schema: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        user_id: 'INT NOT NULL',
        merchant_transaction_id: 'VARCHAR(100) UNIQUE NOT NULL',
        phonepe_transaction_id: 'VARCHAR(100) NULL',
        amount: 'DECIMAL(15, 2) NOT NULL',
        status: 'ENUM("pending", "success", "failed", "cancelled") DEFAULT "pending"',
        payment_method: 'VARCHAR(50) NULL',
        payment_provider: 'VARCHAR(50) DEFAULT "phonepe"',
        
        // Payment details
        description: 'TEXT NULL',
        callback_url: 'VARCHAR(255) NULL',
        success_url: 'VARCHAR(255) NULL',
        failure_url: 'VARCHAR(255) NULL',
        
        // Response data
        provider_response: 'TEXT NULL',
        failure_reason: 'TEXT NULL',
        
        // Additional fields
        currency: 'VARCHAR(3) DEFAULT "INR"',
        customer_phone: 'VARCHAR(15) NULL',
        customer_email: 'VARCHAR(100) NULL',
        
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    },
    foreignKeys: [
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
    ]
};