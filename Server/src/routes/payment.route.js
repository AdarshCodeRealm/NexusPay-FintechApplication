import express from "express";
import { 
  initiatePhonePePayment, 
  verifyPhonePePayment, 
  paymentStatus, 
  checkPaymentStatus, 
  getPaymentHistory, 
  handlePhonePeWebhook, 
  downloadTransactionReceipt 
} from "../controllers/payment.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.route("/status").get(paymentStatus);
router.route("/verify").get(verifyPhonePePayment);
router.route("/webhook").post(handlePhonePeWebhook);

// Protected routes
router.route("/initiate").post(auth, initiatePhonePePayment);
router.route("/check/:transactionId").get(auth, checkPaymentStatus);
router.route("/history").get(auth, getPaymentHistory);
router.route("/receipt/:transactionId").get(auth, downloadTransactionReceipt);

// Admin/Debug routes for checking and fixing payment issues
router.route("/debug/check-payments").get(auth, async (req, res) => {
  try {
    const { checkPaymentStatusInDB } = await import('../utils/checkPaymentStatus.js');
    const result = await checkPaymentStatusInDB();
    
    res.json({
      success: true,
      message: "Payment status check completed",
      data: {
        recentPayments: result.recentPayments.length,
        statusCounts: result.statusCounts,
        successfulPayments: result.successfulPayments.length,
        problematicPayments: result.problematicPayments.length,
        issues: result.problematicPayments.map(p => ({
          transactionId: p.transactionId,
          amount: p.amount,
          user: p.user?.fullName,
          status: p.status
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: error.message
    });
  }
});

router.route("/debug/fix-wallet-balances").post(auth, async (req, res) => {
  try {
    const { fixWalletBalanceForSuccessfulPayments } = await import('../utils/checkPaymentStatus.js');
    const fixedPayments = await fixWalletBalanceForSuccessfulPayments();
    
    res.json({
      success: true,
      message: `Fixed ${fixedPayments.length} payment(s)`,
      data: {
        fixedCount: fixedPayments.length,
        fixedPayments: fixedPayments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fix wallet balances",
      error: error.message
    });
  }
});

export default router;