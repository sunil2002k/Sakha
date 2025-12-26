import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { show_KYC, submitKYC } from "../controllers/kyc.controller.js";

const kycRouter = Router();

kycRouter.post("/submit", upload.single("idCard"), submitKYC);

kycRouter.get("/all", show_KYC);

export default kycRouter;
