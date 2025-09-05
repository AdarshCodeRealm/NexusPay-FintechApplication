import { Router } from "express";
import {
  getWalletBalance,
  addMoneyToWallet,
  transferMoney,
  withdrawMoney,
  getTransactionHistory,
  mobileRecharge,
} from "../controllers/wallet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/balance").get(getWalletBalance);
router.route("/add-money").post(addMoneyToWallet);
router.route("/transfer").post(transferMoney);
router.route("/withdraw").post(withdrawMoney);
router.route("/transactions").get(getTransactionHistory);
router.route("/mobile-recharge").post(mobileRecharge);

export default router;