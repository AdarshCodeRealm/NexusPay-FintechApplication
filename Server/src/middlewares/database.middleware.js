import { connectDB } from "../db/index.js";

let modelsInitialized = false;

const initializeDatabase = async (req, res, next) => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize models only once
    if (!modelsInitialized) {
      await import("../models/index.js");
      modelsInitialized = true;
    }
    
    next();
  } catch (error) {
    console.error("Database initialization error:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export { initializeDatabase };