import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from "dotenv";

// Load environment variables with absolute path
dotenv.config({ path: "./.env" });

// Database configuration using correct environment variables
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
  password: '***HIDDEN***'
});

// Sequelize instance optimized for Amazon RDS
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: parseInt(dbConfig.port),
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: process.env.NODE_ENV === 'production' ? 10 : 15, // Optimized for RDS
      min: 2,
      acquire: 30000, // Reduced timeout for RDS
      idle: 10000,
    },
    dialectOptions: {
      // Removed invalid options: acquireTimeout, timeout
      connectTimeout: 30000, // Valid option for connection timeout
      // SSL configuration for Amazon RDS
      ssl: process.env.NODE_ENV === 'production' || dbConfig.host.includes('rds.amazonaws.com') ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      // Additional RDS optimizations
      charset: 'utf8mb4'
      // Removed collate option as it's invalid for dialectOptions
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
    retry: {
      max: 3,
      timeout: 20000, // Reduced for faster retries
      match: [
        /ECONNRESET/,
        /ENOTFOUND/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /EAI_AGAIN/,
        /ER_ACCESS_DENIED_ERROR/
      ]
    }
  }
);

let isConnected = false;

// Improved database creation for Amazon RDS
async function createDatabase() {
  let connection;
  try {
    connection = mysql2.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      // Removed invalid options: connectTimeout, acquireTimeout, timeout
      ssl: dbConfig.host.includes('rds.amazonaws.com') ? {
        require: true,
        rejectUnauthorized: false
      } : false
    });

    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('❌ Failed to connect to MySQL server:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to MySQL server');
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``, (error, results) => {
        if (error) {
          console.error('❌ Error creating database:', error.message);
          reject(error);
        } else {
          console.log(`✅ Database '${dbConfig.database}' created or already exists`);
          resolve(results);
        }
      });
    });
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.end();
    }
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
