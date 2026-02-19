import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import FundedProject from "../models/fundedProject.model.js";
import { KYCModel } from "../models/kyc.model.js";
import { sendEmail } from "../utils/email.service.js";

// ─────────────────────────────────────────────────────────────
// STATS  GET /api/v1/admin/stats
// ─────────────────────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
  try {
    const [userCount, projectCount, kycPending, totalFundingResult] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      KYCModel.countDocuments({ status: "pending" }),
      FundedProject.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      userCount,
      projectCount,
      kycPending,
      totalFunded: totalFundingResult[0]?.total || 0,
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// ANALYTICS  GET /api/v1/admin/analytics
// ─────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const formatMonthly = (raw) =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const found = raw.find(
          (r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1
        );
        return { label: monthNames[d.getMonth()], value: found?.count || 0 };
      });

    const [
      monthlySignupsRaw,
      monthlyProjectsRaw,
      kycStats,
      projectStats,
      totalFundingResult,
    ] = await Promise.all([
      // Monthly signups
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      // Monthly projects
      Project.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      // KYC breakdown by status
      KYCModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      // Project breakdown by adminStatus
      Project.aggregate([
        { $group: { _id: "$adminStatus", count: { $sum: 1 } } },
      ]),
      // Total funded
      FundedProject.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    // Shape KYC breakdown: { pending: N, verified: N, rejected: N }
    const kycBreakdown = { pending: 0, verified: 0, rejected: 0 };
    kycStats.forEach((k) => { if (k._id) kycBreakdown[k._id] = k.count; });

    // Shape project breakdown: { pending: N, approved: N, rejected: N }
    const projectBreakdown = { pending: 0, approved: 0, rejected: 0 };
    projectStats.forEach((p) => { if (p._id) projectBreakdown[p._id] = p.count; });

    res.status(200).json({
      success: true,
      monthlySignups: formatMonthly(monthlySignupsRaw),
      monthlyProjects: formatMonthly(monthlyProjectsRaw),
      kycBreakdown,
      projectBreakdown,
      totalFunded: totalFundingResult[0]?.total || 0,
    });
  } catch (error) {
    console.error("getAnalytics error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// ALL USERS  GET /api/v1/admin/users
// ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    // User model has select:false on password, so no need to explicitly exclude
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// BAN / UNBAN  PUT /api/v1/admin/users/:id/ban
// body: { banned: true | false }
// ─────────────────────────────────────────────────────────────
export const updateUserBanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    if (typeof banned !== "boolean") {
      return res.status(400).json({ message: "'banned' field must be true or false" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Never ban another admin
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot ban an admin account" });
    }

    user.isBanned = banned;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: banned ? "Your account has been suspended" : "Your account has been reinstated",
      message: banned
        ? "Your InnovateU account has been suspended by an administrator. Please contact support if you believe this is a mistake."
        : "Your InnovateU account suspension has been lifted. You may now log in and use the platform.",
    });

    res.status(200).json({
      success: true,
      message: `User ${banned ? "banned" : "unbanned"} successfully`,
    });
  } catch (error) {
    console.error("updateUserBanStatus error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// CHANGE ROLE  PUT /api/v1/admin/users/:id/role
// body: { role: "student" | "mentor" | "admin" }
// Matches your User model enum: ["student", "mentor", "admin"]
// ─────────────────────────────────────────────────────────────
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Matches the enum in your user.model.js exactly
    const allowedRoles = ["student", "mentor", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(", ")}` });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, message: "Role updated successfully", user });
  } catch (error) {
    console.error("updateUserRole error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// ALL PROJECTS  GET /api/v1/admin/projects
// ─────────────────────────────────────────────────────────────
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("addedBy", "fullName email")   // your schema uses addedBy
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate funding per project from FundedProject
    const projectIds = projects.map((p) => p._id);
    const fundingAgg = await FundedProject.aggregate([
      { $match: { project: { $in: projectIds }, status: "completed" } },
      {
        $group: {
          _id: "$project",
          totalFunded: { $sum: "$totalPrice" },
          backerCount: { $sum: 1 },
        },
      },
    ]);

    const fundingMap = {};
    fundingAgg.forEach((f) => { fundingMap[f._id.toString()] = f; });

    const shaped = projects.map((p) => {
      const f = fundingMap[p._id.toString()] || { totalFunded: 0, backerCount: 0 };
      return {
        ...p,
        ownerName: p.addedBy?.fullName || "—",
        ownerEmail: p.addedBy?.email || "—",
        raised: f.totalFunded,
        backerCount: f.backerCount,
        goal: p.targetAmount || 0,
        status: p.adminStatus || "pending",
      };
    });

    res.status(200).json(shaped);
  } catch (error) {
    console.error("getAllProjects error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// APPROVE PROJECT  PUT /api/v1/admin/projects/:id/approve
// body: { note?: string }
// ─────────────────────────────────────────────────────────────
export const approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("addedBy", "email fullName");
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.adminStatus = "approved";
    project.reviewedAt = new Date();
    project.reviewedBy = req.user._id;
    project.reviewNote = req.body.note || "";
    await project.save();

    if (project.addedBy?.email) {
      await sendEmail({
        email: project.addedBy.email,
        subject: "Your project has been approved! 🎉",
        message: `Congratulations! Your project "${project.title}" has been approved and is now live on InnovateU.${req.body.note ? `\n\nNote from admin: ${req.body.note}` : ""}`,
      });
    }

    res.status(200).json({ success: true, message: "Project approved and owner notified" });
  } catch (error) {
    console.error("approveProject error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// REJECT PROJECT  PUT /api/v1/admin/projects/:id/reject
// body: { note: string }
// ─────────────────────────────────────────────────────────────
export const rejectProject = async (req, res) => {
  try {
    const { note } = req.body;
    const project = await Project.findById(req.params.id).populate("addedBy", "email fullName");
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.adminStatus = "rejected";
    project.reviewedAt = new Date();
    project.reviewedBy = req.user._id;
    project.reviewNote = note || "";
    await project.save();

    if (project.addedBy?.email) {
      await sendEmail({
        email: project.addedBy.email,
        subject: "Update on your project submission",
        message: `Your project "${project.title}" was not approved at this time.${note ? `\n\nReason: ${note}` : ""}\n\nYou may revise your submission and resubmit.`,
      });
    }

    res.status(200).json({ success: true, message: "Project rejected and owner notified" });
  } catch (error) {
    console.error("rejectProject error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// FLAG / UNFLAG  PUT /api/v1/admin/projects/:id/flag
// ─────────────────────────────────────────────────────────────
export const flagProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.isFlagged = !project.isFlagged;
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project ${project.isFlagged ? "flagged" : "unflagged"}`,
      isFlagged: project.isFlagged,
    });
  } catch (error) {
    console.error("flagProject error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// ALL TRANSACTIONS  GET /api/v1/admin/transactions
// Reads from FundedProject — your actual payment records model
// ─────────────────────────────────────────────────────────────
export const getAllTransactions = async (req, res) => {
  try {
    const records = await FundedProject.find()
      .populate("project", "title")
      .populate("fundedBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    const shaped = records.map((r) => ({
      ...r,
      userName: r.fundedBy?.fullName || "—",
      userEmail: r.fundedBy?.email || "—",
      projectTitle: r.project?.title || "—",
      amount: r.totalPrice,
    }));

    res.status(200).json(shaped);
  } catch (error) {
    console.error("getAllTransactions error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
// ISSUE REFUND  PUT /api/v1/admin/transactions/:id/refund
// id = FundedProject._id
// ─────────────────────────────────────────────────────────────
export const issueRefund = async (req, res) => {
  try {
    const record = await FundedProject.findById(req.params.id)
      .populate("fundedBy", "email fullName")
      .populate("project", "title");

    if (!record) return res.status(404).json({ message: "Transaction not found" });

    if (record.status !== "completed") {
      return res.status(400).json({ message: "Only completed transactions can be refunded" });
    }

    record.status = "refunded";
    record.refundedAt = new Date();
    record.refundedBy = req.user._id;
    await record.save();

    if (record.fundedBy?.email) {
      await sendEmail({
        email: record.fundedBy.email,
        subject: "Refund Processed — InnovateU",
        message: `A refund of NPR ${record.totalPrice} for your contribution to "${record.project?.title}" has been processed. Please allow a few business days for it to reflect in your account.`,
      });
    }

    res.status(200).json({ success: true, message: "Refund issued and backer notified" });
  } catch (error) {
    console.error("issueRefund error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};