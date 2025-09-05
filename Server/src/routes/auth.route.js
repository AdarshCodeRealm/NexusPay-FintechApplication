import { Router } from "express";
import {
  registerUser,
  sendLoginOTP,
  verifyOTPAndLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/send-otp").post(sendLoginOTP);
router.route("/verify-otp").post(verifyOTPAndLogin);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);

export default router;