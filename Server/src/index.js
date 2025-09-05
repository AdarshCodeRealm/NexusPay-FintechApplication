// npm run dev  --->> to start nodemon server
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from './app.js';

// Configure environment variables
dotenv.config({ path: './.env' });

// Import models to ensure associations are established
import "./models/index.js";

const PORT = process.env.PORT || 3000;

// For Vercel serverless deployment
if (process.env.NODE_ENV === 'production') {
    // Export the app for Vercel
    export default app;
} else {
    // Connect to MySQL Database for local development
    connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ MySQL database connection failed !!! ", err);
    });
}

// Initialize database connection for production
connectDB().catch((err) => {
    console.log("❌ Database connection error: ", err);
});