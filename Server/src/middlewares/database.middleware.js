import { connectDB, sequelize } from "../db/index.js";

let modelsInitialized = false;
let dbConnectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

const initializeDatabase = async (req, res, next) => {
  try {
    console.log('🔍 Database middleware - Initializing connection...');
    
    // Test connection with retry logic for production
    let connectionError = null;
    for (let attempt = 1; attempt <= MAX_CONNECTION_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 Database connection attempt ${attempt}/${MAX_CONNECTION_ATTEMPTS}`);
        
        // Connect to database with timeout
        await Promise.race([
          connectDB(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          )
        ]);
        
        // Test the connection is actually working
        await sequelize.authenticate();
        console.log('✅ Database connection verified in middleware');
        connectionError = null;
        break;
      } catch (error) {
        connectionError = error;
        console.warn(`⚠️ Database connection attempt ${attempt} failed:`, error.message);
        
        if (attempt < MAX_CONNECTION_ATTEMPTS) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (connectionError) {
      throw connectionError;
    }
    
    // Initialize models only once
    if (!modelsInitialized) {
      console.log('📦 Initializing database models...');
      await import("../models/index.js");
      modelsInitialized = true;
      console.log('✅ Database models initialized');
    }
    
    // Reset connection attempts counter on success
    dbConnectionAttempts = 0;
    
    next();
  } catch (error) {
    dbConnectionAttempts++;
    console.error("💥 Database initialization error:", {
      message: error.message,
      name: error.name,
      attempts: dbConnectionAttempts,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Provide different error responses based on error type
    let statusCode = 500;
    let errorMessage = "Database connection failed";
    
    if (error.name === 'SequelizeConnectionError' || error.name === 'ConnectionError') {
      statusCode = 503;
      errorMessage = "Database service temporarily unavailable";
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      errorMessage = "Database connection timeout";
    } else if (error.name === 'SequelizeAccessDeniedError') {
      statusCode = 503;
      errorMessage = "Database access denied";
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name,
        attempts: dbConnectionAttempts
      } : 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
};

export { initializeDatabase };