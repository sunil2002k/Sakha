import mongoose from "mongoose";

// Your existing schema with refund tracking added.
// Nothing removed — only additions marked with "NEW".

const fundedProjectSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    fundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["khalti", "esewa"],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "refunded"],
      default: "pending",
    },

    // ── NEW: Refund tracking ──────────────────────────────────
    refundedAt: {
      type: Date,
      default: null,
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for admin transaction queries
fundedProjectSchema.index({ status: 1 });
fundedProjectSchema.index({ project: 1 });
fundedProjectSchema.index({ fundedBy: 1 });
fundedProjectSchema.index({ createdAt: -1 });

const FundedProject = mongoose.model("fundedProject", fundedProjectSchema);
export default FundedProject;