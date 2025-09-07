import { Router } from "express";
import {
  updateProfile,
  submitKYC,
  approveKYC,
  rejectKYC,
  addRetailer,
  getRetailers,
  updateUserStatus,
  getAllUsers,
  searchUserByPhone,
} from "../controllers/user.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { initializeDatabase } from "../middlewares/database.middleware.js";

const router = Router();

// Apply database initialization middleware first
router.use(initializeDatabase);

// All routes are protected
router.use(verifyJWT);

// Profile management
router.route("/profile").patch(updateProfile);

// User search by phone
router.route("/search/:phone").get(searchUserByPhone);

// KYC routes
router.route("/kyc/submit").post(
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "address", maxCount: 1 }
  ]),
  submitKYC
);

// Admin/Distributor routes for KYC management
router.route("/kyc/:userId/approve").patch(verifyRole("admin", "distributor"), approveKYC);
router.route("/kyc/:userId/reject").patch(verifyRole("admin", "distributor"), rejectKYC);

// Distributor routes for managing retailers
router.route("/retailers").get(verifyRole("distributor"), getRetailers);
router.route("/retailers").post(verifyRole("distributor"), addRetailer);

// Admin routes
router.route("/").get(verifyRole("admin"), getAllUsers);
router.route("/:userId/status").patch(verifyRole("admin"), updateUserStatus);

export default router;