import { Router } from "express";
import {
  addBeneficiary,
  getBeneficiaries,
  updateBeneficiary,
  deleteBeneficiary,
  verifyBeneficiary,
} from "../controllers/beneficiary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { initializeDatabase } from "../middlewares/database.middleware.js";

const router = Router();

// Apply database initialization middleware first
router.use(initializeDatabase);

// All routes are protected
router.use(verifyJWT);

router.route("/").get(getBeneficiaries).post(addBeneficiary);
router.route("/:beneficiaryId").put(updateBeneficiary).delete(deleteBeneficiary);
router.route("/:beneficiaryId/verify").patch(verifyBeneficiary);

export default router;