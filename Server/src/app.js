import express from "express"
import cookieParser from "cookie-parser"
import Cors from "cors"
import dotenv from "dotenv"
import { sequelize } from "./db/index.js"

dotenv.config({ path: ".env" })

const app = express()

// Add request ID middleware early in the stack
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(7);
  req.timestamp = new Date().toISOString();
  next();
});

// Enhanced logging middleware for Vercel debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`[${req.requestId}] ${req.method} ${req.originalUrl}`, {
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']?.substring(0, 50),
        'origin': req.headers.origin
      },
      body: req.body ? 'Body present' : 'No body',
      timestamp: req.timestamp
    });
  }
  next();
});

// Middleware setup
app.use(
  Cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Alternative dev port
      "https://nexus-pay-fintech-application-8gni.vercel.app", // Production frontend
      "https://nexus-pay-fintech-application-8gni-ouod51nb5.vercel.app", // Updated production frontend
      "https://nexaspay-fintech.vercel.app", // Alternative production URL
      process.env.CORS_ORIGIN
    ].filter(Boolean), // Remove any undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
)

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ limit: "16kb", extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

// Import routes
import authRouter from "./routes/auth.route.js"
import walletRouter from "./routes/wallet.route.js"
import beneficiaryRouter from "./routes/beneficiary.route.js"
import userRouter from "./routes/user.route.js"
import paymentRouter from "./routes/payment.route.js"
import testRouter from "./routes/test.route.js"

// Route declarations
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/wallet", walletRouter)
app.use("/api/v1/beneficiaries", beneficiaryRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/payments", paymentRouter)
app.use("/api/v1/test", testRouter)

// Add a simple test endpoint for Vercel debugging
app.get("/api/v1/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working on Vercel",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    headers: req.headers
  });
});

// Enhanced health check route with more debugging info
app.get("/api/v1/health", async (req, res) => {
  try {
    // Test database connectivity
    await sequelize.authenticate();
    
    res.status(200).json({ 
      status: "OK", 
      message: "Server is running",
      database: "Connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'local'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: "ERROR", 
      message: "Server is running but database is unavailable",
      database: "Disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Database health check endpoint
app.get("/api/v1/health/database", async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await sequelize.authenticate();
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT 1 as test');
    
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      status: "OK",
      message: "Database connection successful",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      queryResult: results[0]
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Database health check failed:', error);
    
    res.status(503).json({
      status: "ERROR",
      message: "Database connection failed",
      error: {
        name: error.name,
        message: error.message
      },
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
});

// Favicon route to prevent 404 errors
app.get("/favicon.ico", (req, res) => {
  res.status(204).end()
})

// Root route for Vercel
app.get("/", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Fintech API Server is running",
    version: "1.0.0"
  })
})

// Enhanced error handling middleware with detailed logging
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Log the full error details
  console.error(`[${timestamp}] Error in ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    name: err.name,
    stack: err.stack,
    body: req.body,
    headers: req.headers,
    params: req.params,
    query: req.query
  });

  // Check if it's already an ApiError (from our controllers)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? {
        name: err.name,
        stack: err.stack
      } : undefined,
      timestamp
    });
  }

  // Handle Sequelize/Database errors specifically
  if (err.name && err.name.includes('Sequelize')) {
    console.error('Database Error Details:', {
      name: err.name,
      message: err.message,
      sql: err.sql || 'No SQL query',
      original: err.original || 'No original error'
    });

    return res.status(500).json({
      success: false,
      message: "Database error occurred",
      error: process.env.NODE_ENV === 'development' ? {
        name: err.name,
        message: err.message,
        sql: err.sql
      } : "Database connection issue",
      timestamp
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: err.message,
      timestamp
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Authentication error",
      error: err.message,
      timestamp
    });
  }

  // Generic error fallback
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'development' 
      ? `Unhandled error: ${err.message}` 
      : "Internal server error",
    error: process.env.NODE_ENV === 'development' ? {
      name: err.name,
      message: err.message,
      stack: err.stack
    } : undefined,
    timestamp
  });
});

export { app }