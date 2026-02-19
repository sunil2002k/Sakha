import express from "express";
import {
  getAdminStats,
  getAnalytics,
  getAllUsers,
  updateUserBanStatus,
  updateUserRole,
  getAllProjects,
  approveProject,
  rejectProject,
  flagProject,
  getAllTransactions,
  issueRefund,
} from "../controllers/admin.controller.js";
import authorize, { isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require a valid JWT (authorize) + admin role (isAdmin)
// This matches the pattern already used in your kyc.routes.js

// ── Stats & Analytics ────────────────────────────────────────
router.get("/stats",     authorize, isAdmin, getAdminStats);
router.get("/analytics", authorize, isAdmin, getAnalytics);

// ── User Management ──────────────────────────────────────────
router.get("/users",              authorize, isAdmin, getAllUsers);
router.put("/users/:id/ban",      authorize, isAdmin, updateUserBanStatus);
router.put("/users/:id/role",     authorize, isAdmin, updateUserRole);

// ── Project Management ───────────────────────────────────────
router.get("/projects",                authorize, isAdmin, getAllProjects);
router.put("/projects/:id/approve",    authorize, isAdmin, approveProject);
router.put("/projects/:id/reject",     authorize, isAdmin, rejectProject);
router.put("/projects/:id/flag",       authorize, isAdmin, flagProject);

// ── Transactions & Funding ───────────────────────────────────
router.get("/transactions",             authorize, isAdmin, getAllTransactions);
router.put("/transactions/:id/refund",  authorize, isAdmin, issueRefund);

export default router;