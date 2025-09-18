import dotenv from "dotenv";
import { app } from '../src/app.js';
import { connectDB } from '../src/db/index.js';

// Configure environment variables for Vercel
dotenv.config({ path: '../.env' });

// Initialize database connection once (will be reused across invocations)
let isDbConnected = false;

const initializeDatabase = async () => {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
      console.log('✅ Database connected for serverless function');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }
};

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Set CORS headers for all responses - more explicit configuration
    const allowedOrigins = [
      'http://localhost:5173',
      'https://nexus-pay-fintech-application-8gni.vercel.app',
      'https://nexuspay-frontend.vercel.app'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Initialize database connection
    await initializeDatabase();
    
    // Create a promise to handle the Express app request
    return new Promise((resolve, reject) => {
      // Override res.end to capture when the response is finished
      const originalEnd = res.end;
      res.end = function(...args) {
        originalEnd.apply(this, args);
        resolve();
      };

      // Handle the request with Express app
      app(req, res, (err) => {
        if (err) {
          console.error('Express app error:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Internal server error',
              error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
            });
          }
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('Vercel Handler error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  }
}