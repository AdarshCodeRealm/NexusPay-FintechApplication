import { Router } from "express";
import {
    createMoneyRequest,
    getMoneyRequests,
    payMoneyRequest,
    declineMoneyRequest,
    cancelMoneyRequest,
    getMoneyRequestStats
} from "../controllers/moneyRequest.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(auth);

// Money request operations
router.route("/").get(getMoneyRequests).post(createMoneyRequest);
router.route("/stats").get(getMoneyRequestStats);
router.route("/:requestId/pay").patch(payMoneyRequest);
router.route("/:requestId/decline").patch(declineMoneyRequest);
router.route("/:requestId/cancel").patch(cancelMoneyRequest);

export default router;