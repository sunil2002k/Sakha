import { Router } from "express";
import {
    initiateEsewaPayment,
    completeEsewaPayment,
    getProjectFundingStatus,
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/initiate-payment", initiateEsewaPayment );
paymentRouter.get("/complete-payment", completeEsewaPayment);
paymentRouter.get("/:id/funding-status",getProjectFundingStatus);

export default paymentRouter;
