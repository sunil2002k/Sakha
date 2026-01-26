import express from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import authorize, { isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/stats", authorize, isAdmin, getAdminStats);

export default router;