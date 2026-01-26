import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import authorize, { isAdmin } from "../middlewares/auth.middleware.js";
import {
  show_KYC,
  submitKYC,
  verifyKYC,
  rejectKYC,
} from "../controllers/kyc.controller.js";

const kycRouter = Router();

kycRouter.post("/submit", upload.single("idCard"), submitKYC);

kycRouter.get("/all", show_KYC);

kycRouter.put("/:id/verify", authorize, isAdmin, verifyKYC);
kycRouter.put("/:id/reject", authorize, isAdmin, rejectKYC);

export default kycRouter;
