import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  let connection;
  
  try {
    // Database connection configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fintech_db'
    };

    console.log('🔧 Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      password: dbConfig.password ? '***HIDDEN***' : 'NOT SET'
    });

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');

    // Check if distributorId column exists
    console.log('📋 Checking if distributorId column exists...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'distributorId'
    `, [dbConfig.database]);

    if (columns.length > 0) {
      console.log('✅ distributorId column already exists');
    } else {
      console.log('➕ Adding distributorId column to users table...');
      
      // Add distributorId column
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN distributorId INT NULL,
        ADD INDEX idx_users_distributor (distributorId),
        ADD CONSTRAINT fk_users_distributor 
          FOREIGN KEY (distributorId) 
          REFERENCES users(id) 
          ON DELETE SET NULL 
          ON UPDATE CASCADE
      `);
      
      console.log('✅ distributorId column added successfully');
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Database connection closed');
    }
  }
};

// Run the migration
runMigration();