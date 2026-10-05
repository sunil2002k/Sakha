import mongoose from "mongoose";
import FundedProject from "../models/fundedProject.model.js";
import Payment from "../models/payment.model.js";
import { esewaPaymentHash, verifyEsewa } from "../utils/esewa.js";
import Project from "../models/project.model.js";
import { FRONTEND_URL } from "../config/env.js";


const getPaymentRedirect = (requestedRedirect) => {
  const fallback = `${FRONTEND_URL}/payment-result`;
  if (typeof requestedRedirect !== "string") return fallback;

  try {
    const target = new URL(requestedRedirect);
    if (
      target.origin !== new URL(FRONTEND_URL).origin ||
      target.pathname !== "/payment-result"
    ) {
      return fallback;
    }
    target.hash = "";
    return target.toString();
  } catch {
    return fallback;
  }
};

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    // Validate project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Create pending payment record
    const fundedProject = await FundedProject.create({
      project: projectId,
      amount: paymentAmount,
      totalPrice: paymentAmount,
      fundedBy: req.user._id,
      paymentMethod: "esewa",
      status: "pending",
    });

    // Generate eSewa hash
    const paymentInit = await esewaPaymentHash({
      amount: paymentAmount,
      transaction_uuid: fundedProject._id.toString(),
    });

    return res.status(200).json({
      success: true,
      signature: paymentInit.signature,
      signed_field_names: paymentInit.signed_field_names,
      transaction_uuid: fundedProject._id.toString(),
      amount: paymentAmount,
    });

  } catch (error) {
    console.error("Error initiating payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
    });
  }
};


/**
 * @desc Verify payment after success and redirect user to frontend payment-result
 */
export const completeEsewaPayment = async (req, res) => {
  const { data } = req.query;

  try {
    const paymentInfo = await verifyEsewa(data);

    // Find the FundedProject record using the transaction_uuid (which is the _id of the FundedProject)
    const fundedProjectRecord = await FundedProject.findById(
      paymentInfo.response.transaction_uuid
    );
    if (!fundedProjectRecord) {
      // Redirect to frontend with error payload
      const payloadErr = {
        success: false,
        message: "FundedProject record not found",
      };
      const encodedErr = Buffer.from(JSON.stringify(payloadErr)).toString(
        "base64"
      );
      const redirectTo = getPaymentRedirect(req.query.redirect);
      const sep = redirectTo.includes("?") ? "&" : "?";
      return res.redirect(
        `${redirectTo}${sep}data=${encodeURIComponent(encodedErr)}`
      );
    }

    if (
      Number(paymentInfo.decodedData.total_amount) !==
      Number(fundedProjectRecord.totalPrice)
    ) {
      throw new Error("Payment amount does not match the pending transaction");
    }

    const paymentRecord = {
      transactionId: paymentInfo.decodedData.transaction_code,
      projectId: fundedProjectRecord.project,
      amount: fundedProjectRecord.totalPrice,
      dataFromVerificationReq: paymentInfo,
      paymentGateway: "esewa",
      status: "success",
    };
    let paymentData = await Payment.findOne({
      transactionId: paymentRecord.transactionId,
      projectId: paymentRecord.projectId,
    });

    if (!paymentData) {
      const completedFunding = await FundedProject.findOneAndUpdate(
        { _id: fundedProjectRecord._id, status: "pending" },
        { $set: { status: "completed" } },
        { new: true }
      );
      const latestFunding = completedFunding || await FundedProject.findById(
        fundedProjectRecord._id
      ).select("status");

      if (latestFunding?.status === "completed") {
        try {
          paymentData = await Payment.create(paymentRecord);
        } catch (error) {
          if (error.code !== 11000) throw error;
          paymentData = await Payment.findOne({
            transactionId: paymentRecord.transactionId,
            projectId: paymentRecord.projectId,
          });
        }
      } else {
        paymentData = await Payment.findOne({
          transactionId: paymentRecord.transactionId,
          projectId: paymentRecord.projectId,
        });
      }
    }

    if (!paymentData) {
      throw new Error("Payment is already being processed");
    }

    // Prepare payload to send to frontend
    const payload = {
      success: true,
      message: "Payment successful",
      paymentData: {
        transactionId: paymentData.transactionId,
        projectId: paymentData.projectId,
        amount: paymentData.amount,
        paymentGateway: paymentData.paymentGateway,
        status: paymentData.status,
        _id: paymentData._id,
        createdAt: paymentData.createdAt,
      },
    };

    // Determine frontend redirect target (can be passed by caller)
    const redirectTo = getPaymentRedirect(req.query.redirect);
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    const sep = redirectTo.includes("?") ? "&" : "?";

    return res.redirect(
      `${redirectTo}${sep}data=${encodeURIComponent(encoded)}`
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    const payload = {
      success: false,
      message: "Payment verification failed",
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    const redirectTo = getPaymentRedirect(req.query.redirect);
    const sep = redirectTo.includes("?") ? "&" : "?";
    return res.redirect(
      `${redirectTo}${sep}data=${encodeURIComponent(encoded)}`
    );
  }
};


export const getProjectFundingStatus = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    // 1. Calculate the total funded amount
    const result = await FundedProject.aggregate([
      {
        $match: {
          project: mongoose.Types.ObjectId.createFromHexString(projectId), // Match by projectId
          status: "completed", // Only include successful payments
        },
      },
      {
        $group: {
          _id: null,
          totalFunded: { $sum: "$totalPrice" }, // Sum the 'amount' field
        },
      },
    ]);

    const totalFunded = result.length > 0 ? result[0].totalFunded : 0;

    // 2. Fetch the project's target amount
    const project = await Project.findById(projectId).select('targetAmount');
    const targetAmount = project ? project.targetAmount : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalFunded,
        targetAmount: targetAmount,
        /* The `progress` variable is calculating the percentage progress of the project funding based
        on the total funded amount and the target amount of the project. */
        progress: targetAmount > 0 ? (totalFunded / targetAmount) * 100 : 0,
      },
    });

  } catch (error) {
    console.error("Error fetching project funding status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch funding status",
    });
  }
};