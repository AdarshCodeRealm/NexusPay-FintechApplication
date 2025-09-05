// npm run dev  --->> to start nodemon server
import dotenv from "dotenv";
import { app } from './app.js';

// Configure environment variables
dotenv.config({ path: './.env' });

// Export the app as default for Vercel serverless
export default app;