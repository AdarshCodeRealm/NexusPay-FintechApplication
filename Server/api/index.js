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
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

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