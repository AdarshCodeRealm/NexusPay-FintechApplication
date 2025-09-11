import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from "dotenv";

// Load environment variables with absolute path
dotenv.config({ path: "./.env" });

// Debug environment variables
console.log('🔍 Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT_SET');
console.log('DB_PORT:', process.env.DB_PORT || 'NOT_SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT_SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT_SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***HIDDEN***' : 'NOT_SET');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'fintech_db'
};

console.log('🔧 Database config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  password: dbConfig.password ? '***HIDDEN***' : 'NOT_SET'
});

// Sequelize instance with serverless optimizations
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: parseInt(dbConfig.port),
    dialect: 'mysql',
    dialectModule: mysql2, // Use mysql2 directly instead of mysql2/promise
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Enable logging only in development
    pool: {
      max: process.env.NODE_ENV === 'production' ? 2 : 5, // Reduced for serverless
      min: 0,
      acquire: 30000, // acquireTimeout should be in pool config, not dialectOptions
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 30000, // This is valid for MySQL2
      // Removed acquireTimeout and timeout as they're not valid MySQL2 connection options
      // SSL configuration for production databases
      ssl: process.env.NODE_ENV === 'production' ? {
        require: false,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
    // Add retry configuration for production
    retry: {
      max: 3,
      timeout: 30000, // timeout belongs in retry config, not dialectOptions
      match: [
        /ECONNRESET/,
        /ENOTFOUND/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /EAI_AGAIN/
      ]
    }
  }
);

let isConnected = false;

// Create database if it doesn't exist (simplified for serverless)
async function createDatabase() {
  const connection = mysql2.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  });

  try {
    await new Promise((resolve, reject) => {
      connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
    console.log(`✅ Database '${dbConfig.database}' created or already exists`);
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    connection.end();
  }
}

// Simplified database connection for serverless
const connectDB = async () => {
  if (isConnected) {
    return sequelize;
  }
  
  try {
    console.log('🚀 Initializing database connection...');
    
    // Step 1: Create database if it doesn't exist (skip in production)
    if (process.env.NODE_ENV !== 'production') {
      await createDatabase();
    }
    
    // Step 2: Test Sequelize connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Step 3: Import all models to register them with Sequelize
    console.log('📦 Loading Sequelize models...');
    await import('../models/index.js');
    
    // Step 4: Sync database tables (skip force sync in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Synchronizing database tables...');
      await sequelize.sync({ force: false, alter: false });
      console.log('✅ Database tables synchronized successfully');
    }
    
    isConnected = true;
    console.log('🎉 Database initialization completed successfully!');
    return sequelize;
  } catch (error) {
    console.error('💥 Database initialization failed:', error.message);
    throw error;
  }
};

// Graceful shutdown
async function closeConnections() {
  try {
    if (sequelize) {
      await sequelize.close();
      console.log('✅ Database connection closed gracefully');
    }
  } catch (error) {
    console.error('❌ Error closing database connections:', error.message);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeConnections();
  process.exit(0);
});

export { sequelize, connectDB, closeConnections };
