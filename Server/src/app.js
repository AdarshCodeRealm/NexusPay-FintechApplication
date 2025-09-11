import express from "express"
import cookieParser from "cookie-parser"
import Cors from "cors"
import dotenv from "dotenv"
import { sequelize } from "./db/index.js"

dotenv.config({ path: ".env" })

const app = express()

// Middleware setup
app.use(
  Cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Alternative dev port
      "https://nexus-pay-fintech-application-8gni-ouod51nb5.vercel.app", // Production frontend
      process.env.CORS_ORIGIN
    ].filter(Boolean), // Remove any undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Route declarations
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/wallet", walletRouter)
app.use("/api/v1/beneficiaries", beneficiaryRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/payments", paymentRouter)

// Health check route
app.get("/api/v1/health", async (req, res) => {
  try {
    // Test database connectivity
    await sequelize.authenticate();
    
    res.status(200).json({ 
      status: "OK", 
      message: "Server is running",
      database: "Connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong!" 
  });
});

export { app }