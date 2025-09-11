// npm run dev  --->> to start nodemon server
import dotenv from "dotenv";
import { app } from './app.js';
import { connectDB } from './db/index.js';

// Configure environment variables
dotenv.config({ path: './.env' });

// For Vercel serverless functions
export default async function handler(req, res) {
  try {
    // Set CORS headers for Vercel
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Initialize database connection for each request
    await connectDB();
    
    // Use the Express app to handle the request
    await new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    console.error('Vercel Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      console.log('🌟 Starting Fintech Server...');
      
      // Connect to database (this will now create DB, run migrations, and connect)
      await connectDB();
      
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/api/v1/health`);
        console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
        console.log(`🎯 CORS enabled for: ${process.env.CORS_ORIGIN}`);
      });
    } catch (error) {
      console.error('💥 Failed to start server:', error.message);
      process.exit(1);
    }
  };

  // Start the server for local development
  startServer();
}