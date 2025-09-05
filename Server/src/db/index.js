import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
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

// Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: false, // Disable SQL query logging for cleaner output
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  }
);

let isConnected = false;

// Create database if it doesn't exist
async function createDatabase() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  });

  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' created or already exists`);
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Initialize database
const connectDB = async () => {
  if (isConnected) {
    return sequelize;
  }
  
  try {
    console.log('🚀 Initializing database connection...');
    
    // Step 1: Create database if it doesn't exist
    await createDatabase();
    
    // Step 2: Test Sequelize connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Step 3: Import all models to register them with Sequelize
    console.log('📦 Loading Sequelize models...');
    await import('../models/index.js');
    
    // Step 4: Sync database tables (create tables if they don't exist)
    console.log('🔄 Synchronizing database tables...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database tables synchronized successfully');
    
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
