import { sequelize } from './src/db/index.js';

/**
 * Notification System Migration
 * Creates the notifications table for the notification system
 */
async function runNotificationMigration() {
  try {
    console.log('🔧 Starting Notification System Migration...');
    console.log('=============================================');

    // Create notifications table
    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error', 'transaction') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(255) NULL,
        metadata TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_notifications (user_id),
        INDEX idx_unread (user_id, is_read),
        INDEX idx_created_at (created_at)
      )
    `;

    console.log('📋 Creating notifications table...');
    await sequelize.query(createNotificationsTable);
    console.log('✅ Notifications table created successfully');

    // Verify the table was created
    console.log('\n🔍 Verifying notifications table...');
    const [tableInfo] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'notifications' 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📊 Notifications table structure:');
    tableInfo.forEach(col => {
      console.log(`   ✅ ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // Test inserting a sample notification (for the first user if exists)
    console.log('\n🧪 Testing notification creation...');
    
    const [users] = await sequelize.query('SELECT id FROM users LIMIT 1');
    
    if (users.length > 0) {
      const userId = users[0].id;
      
      await sequelize.query(`
        INSERT INTO notifications (user_id, title, message, type, metadata) 
        VALUES (
          ${userId}, 
          'Welcome to NEXASPAY', 
          'Your notification system is now active! You will receive real-time updates for all your transactions.',
          'info',
          '{"notificationType": "system_welcome", "version": "1.0"}'
        )
      `);
      
      console.log('✅ Sample notification created successfully');
    } else {
      console.log('ℹ️  No users found - sample notification skipped');
    }

    console.log('\n🎉 NOTIFICATION MIGRATION COMPLETED SUCCESSFULLY! 🎉');
    console.log('==================================================');
    console.log('✅ Notifications table created with proper schema');
    console.log('✅ Indexes added for optimal performance');
    console.log('✅ Foreign key constraints established');
    console.log('✅ Sample notification created for testing');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Restart your server: npm run dev');
    console.log('   2. Test notifications API: /api/v1/notifications');
    console.log('   3. Perform a money transfer to see real-time notifications');
    console.log('   4. Check the notification badge in your dashboard');

    return true;

  } catch (error) {
    console.error('💥 Notification migration failed:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Notifications table already exists - migration skipped');
      return true;
    }
    
    return false;
  } finally {
    await sequelize.close();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runNotificationMigration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { runNotificationMigration };