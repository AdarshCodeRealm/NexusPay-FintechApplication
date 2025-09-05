import { Router } from "express";
import {
  addBeneficiary,
  getBeneficiaries,
  updateBeneficiary,
  deleteBeneficiary,
  verifyBeneficiary,
} from "../controllers/beneficiary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/").get(getBeneficiaries).post(addBeneficiary);
router.route("/:beneficiaryId").put(updateBeneficiary).delete(deleteBeneficiary);
router.route("/:beneficiaryId/verify").patch(verifyBeneficiary);

export default router;