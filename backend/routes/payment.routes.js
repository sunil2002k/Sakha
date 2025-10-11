import { Router } from "express";
import {
    initiateEsewaPayment 
  ,
  completeEsewaPayment,
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/initiate-payment", initiateEsewaPayment );
paymentRouter.get("/complete-payment", completeEsewaPayment);

export default paymentRouter;
