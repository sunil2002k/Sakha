import { Router } from "express";
import {
  signIn,
  signOut,
  signUp,
  onboard,
} from "../controllers/auth.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);

authRouter.post("/onboarding", authorize, upload.single("resume"), onboard);

authRouter.get("/me", authorize, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default authRouter;
