import { Router } from "express";
import {
  registerUser,
  sendLoginOTP,
  sendDummyOTP,
  verifyOTPAndLogin,
  verifyOTPFor2FA,
  loginUser,
  loginWithPhone,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  sendRegistrationOTP,
  verifyRegistrationOTP,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { initializeDatabase } from "../middlewares/database.middleware.js";

const router = Router();

// Add comprehensive request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[${timestamp}] [${requestId}] 🔍 INCOMING REQUEST:`, {
    method: req.method,
    url: req.originalUrl,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin,
      'host': req.headers.host
    },
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip || req.connection.remoteAddress
  });

  // Add request ID to req object for tracking
  req.requestId = requestId;
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(obj) {
    console.log(`[${timestamp}] [${requestId}] 📤 RESPONSE:`, {
      statusCode: res.statusCode,
      data: obj
    });
    return originalJson.call(this, obj);
  };

  next();
};

// Middleware to validate request body for POST requests
const validateRequestBody = (req, res, next) => {
  console.log(`[${req.requestId}] 🔍 Validating request body...`);
  
  if (req.method === 'POST') {
    // Skip Content-Type validation for routes that don't require JSON bodies
    const skipContentTypeValidation = [
      '/api/v1/auth/logout',
      '/api/v1/auth/refresh-token'
    ];
    
    const shouldSkipValidation = skipContentTypeValidation.some(path => 
      req.originalUrl.includes(path.split('/').pop())
    );
    
    if (!shouldSkipValidation) {
      // Check if Content-Type header is set correctly for routes that need JSON
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`[${req.requestId}] ❌ Invalid Content-Type: ${contentType}`);
        return res.status(400).json({
          success: false,
          message: "Content-Type must be application/json",
          error: `Invalid Content-Type: ${contentType || 'not set'}`,
          requestId: req.requestId
        });
      }
      
      // Check if request body exists for routes that require JSON data
      if (!req.body || Object.keys(req.body).length === 0) {
        console.log(`[${req.requestId}] ❌ Empty request body detected for POST request`);
        return res.status(400).json({
          success: false,
          message: "Request body is required for POST requests",
          error: "Empty request body",
          requestId: req.requestId
        });
      }
    }
    
    console.log(`[${req.requestId}] ✅ Request body validation passed`);
  }
  next();
};

// Apply comprehensive logging in production for debugging
router.use(requestLogger);

// Apply database initialization middleware to all routes
router.use(initializeDatabase);

// Apply request body validation to all routes
router.use(validateRequestBody);

// Add a middleware to handle invalid requests gracefully
const validateRequestMethod = (req, res, next) => {
  // If it's a GET request to POST endpoints, return proper error
  if (req.method === 'GET' && req.originalUrl.includes('/api/v1/auth/')) {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. This endpoint requires POST request.",
      error: `${req.method} method not allowed on ${req.originalUrl}`
    });
  }
  next();
};

router.use(validateRequestMethod);

// Public routes
router.route("/register").post(registerUser);
router.route("/send-registration-otp").post(sendRegistrationOTP);
router.route("/verify-registration-otp").post(verifyRegistrationOTP);
router.route("/login").post(loginUser);
router.route("/login-phone").post(loginWithPhone);
router.route("/send-otp").post(sendLoginOTP);
router.route("/send-dummy-otp").post(sendDummyOTP);
router.route("/verify-otp").post(verifyOTPAndLogin);
router.route("/verify-2fa-otp").post(verifyOTPFor2FA);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);

export default router;