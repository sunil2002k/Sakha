import { Router } from "express";
import {
    initiateEsewaPayment,
    completeEsewaPayment,
    getProjectFundingStatus,
} from "../controllers/payment.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

paymentRouter.post("/initiate-payment", authorize, initiateEsewaPayment);
paymentRouter.get("/complete-payment", completeEsewaPayment);
paymentRouter.get("/:id/funding-status",getProjectFundingStatus);

export default paymentRouter;
