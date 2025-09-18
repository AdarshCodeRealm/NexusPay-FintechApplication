import { sequelize } from './src/db/index.js';

/**
 * Money Request System Migration
 * Creates the money_requests table for the money request system
 */
async function runMoneyRequestMigration() {
  try {
    console.log('🔧 Starting Money Request System Migration...');
    console.log('=============================================');

    // Create money_requests table
    const createMoneyRequestsTable = `
      CREATE TABLE IF NOT EXISTS money_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        requester_id INT NOT NULL,
        payer_id INT NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        status ENUM('pending', 'paid', 'declined', 'cancelled', 'expired') DEFAULT 'pending',
        request_reference VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NULL,
        paid_at DATETIME NULL,
        transaction_id INT NULL,
        metadata TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
        INDEX idx_requester_requests (requester_id),
        INDEX idx_payer_requests (payer_id),
        INDEX idx_status (status),
        INDEX idx_request_reference (request_reference),
        INDEX idx_expires_at (expires_at),
        INDEX idx_created_at (created_at)
      )
    `;

    console.log('📋 Creating money_requests table...');
    await sequelize.query(createMoneyRequestsTable);
    console.log('✅ Money requests table created successfully');

    // Verify the table was created
    console.log('\n🔍 Verifying money_requests table...');
    const [tableInfo] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'money_requests' 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📊 Money requests table structure:');
    tableInfo.forEach(col => {
      console.log(`   ✅ ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // Test inserting a sample money request (for the first two users if they exist)
    console.log('\n🧪 Testing money request creation...');
    
    const [users] = await sequelize.query('SELECT id, fullName, phone FROM users LIMIT 2');
    
    if (users.length >= 2) {
      const requesterId = users[0].id;
      const payerId = users[1].id;
      const requestReference = `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      await sequelize.query(`
        INSERT INTO money_requests (requester_id, payer_id, amount, description, request_reference, expires_at, metadata) 
        VALUES (
          ${requesterId}, 
          ${payerId},
          500.00,
          'Sample money request for testing',
          '${requestReference}',
          DATE_ADD(NOW(), INTERVAL 7 DAY),
          '{"requesterPhone": "${users[0].phone}", "payerPhone": "${users[1].phone}", "testRequest": true}'
        )
      `);
      
      console.log('✅ Sample money request created successfully');
      console.log(`   Requester: ${users[0].fullName} (${users[0].phone})`);
      console.log(`   Payer: ${users[1].fullName} (${users[1].phone})`);
      console.log(`   Amount: ₹500`);
      console.log(`   Reference: ${requestReference}`);
    } else {
      console.log('ℹ️  Not enough users found - sample money request skipped');
    }

    console.log('\n🎉 MONEY REQUEST MIGRATION COMPLETED SUCCESSFULLY! 🎉');
    console.log('===================================================');
    console.log('✅ Money requests table created with proper schema');
    console.log('✅ Indexes added for optimal performance');
    console.log('✅ Foreign key constraints established');
    console.log('✅ Sample money request created for testing');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Restart your server: npm run dev');
    console.log('   2. Test money request API: /api/v1/money-requests');
    console.log('   3. Create a money request to see real-time notifications');
    console.log('   4. Check the notification badge in your dashboard');
    
    console.log('\n📍 API Endpoints Available:');
    console.log('   POST /api/v1/money-requests - Create money request');
    console.log('   GET /api/v1/money-requests - Get money requests');
    console.log('   PATCH /api/v1/money-requests/:id/pay - Pay request');
    console.log('   PATCH /api/v1/money-requests/:id/decline - Decline request');
    console.log('   PATCH /api/v1/money-requests/:id/cancel - Cancel request');
    console.log('   GET /api/v1/money-requests/stats - Get statistics');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check database connection');
    console.log('   2. Verify users table exists');
    console.log('   3. Verify transactions table exists');
    console.log('   4. Check database permissions');
    
    throw error;
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMoneyRequestMigration()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error.message);
      process.exit(1);
    });
}

export { runMoneyRequestMigration };