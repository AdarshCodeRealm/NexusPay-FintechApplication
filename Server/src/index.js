// npm run dev  --->> to start nodemon server
import dotenv from "dotenv";
import { app } from './app.js';
import { connectDB } from './db/index.js';

// Configure environment variables
dotenv.config({ path: './.env' });

// For Vercel serverless functions
export default async function handler(req, res) {
  try {
    // Initialize database connection for each request
    await connectDB();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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