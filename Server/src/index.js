// npm run dev  --->> to start nodemon server
import dotenv from "dotenv";
import { app } from './app.js';
import { connectDB } from './db/index.js';

// Configure environment variables
dotenv.config({ path: './.env' });

// Initialize database connection
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server only for local development
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export the app as default for Vercel serverless
export default app;