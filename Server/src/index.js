// npm run dev  --->> to start nodemon server
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from './app.js';

// Configure environment variables
dotenv.config({ path: './.env' });

// Import models to ensure associations are established
import "./models/index.js";

const PORT = process.env.PORT || 3000;

// Connect to MySQL Database
connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`⚙️  Server is running at port : ${PORT}`);
    });
})
.catch((err) => {
    console.log("❌ MySQL database connection failed !!! ", err);
});