import { Router } from "express";
import {
  initiatePhonePePayment,
  verifyPhonePePayment,
  paymentStatus,
  checkPaymentStatus,
  getPaymentHistory,
  handlePhonePeWebhook,
  downloadTransactionReceipt
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.route("/status").get(paymentStatus);
router.route("/initiate").post(initiatePhonePePayment);
router.route("/verify").get(verifyPhonePePayment);
router.route("/webhook").post(handlePhonePeWebhook);
router.route("/check/:transactionId").get(checkPaymentStatus);

// Protected routes (authentication required)
router.route("/history").get(verifyJWT, getPaymentHistory);
router.route("/receipt/:transactionId").get(verifyJWT, downloadTransactionReceipt);

export default router;