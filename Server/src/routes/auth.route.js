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

// Add request logging middleware to debug the issue
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Body:`, req.body ? JSON.stringify(req.body) : 'No body');
  console.log(`[${timestamp}] Headers:`, req.headers);
  next();
};

// Middleware to validate request body for POST requests
const validateRequestBody = (req, res, next) => {
  if (req.method === 'POST') {
    // Check if Content-Type header is set correctly
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: "Content-Type must be application/json",
        error: `Invalid Content-Type: ${contentType || 'not set'}`
      });
    }
    
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Empty request body detected for POST request');
      return res.status(400).json({
        success: false,
        message: "Request body is required for POST requests",
        error: "Empty request body"
      });
    }
  }
  next();
};

// Apply logging only in development
if (process.env.NODE_ENV === 'development') {
  router.use(requestLogger);
}

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