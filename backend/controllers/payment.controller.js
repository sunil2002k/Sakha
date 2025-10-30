import Funding from "../models/funding.model.js";
import FundedProject from "../models/fundedProject.model.js";
import Payment from "../models/payment.model.js";
import { esewaPaymentHash, verifyEsewa } from "../utils/esewa.js";
import Project from "../models/project.model.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const fundedProject = await FundedProject.create({
      project: projectId,
      amount,
      totalPrice: amount,
      paymentMethod: "esewa",
      status: "pending",
    });

    const paymentInit = await esewaPaymentHash({
      amount,
      transaction_uuid: fundedProject._id.toString(),
    });

    res.status(200).json({
      success: true,
      signature: paymentInit.signature,
      signed_field_names: paymentInit.signed_field_names,
      transaction_uuid: fundedProject._id.toString(),
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate payment" });
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
      const redirectTo = req.query.redirect || `${FRONTEND_URL}/payment-result`;
      const sep = redirectTo.includes("?") ? "&" : "?";
      return res.redirect(
        `${redirectTo}${sep}data=${encodeURIComponent(encodedErr)}`
      );
    }

    // Mark funded project completed
    await FundedProject.findByIdAndUpdate(fundedProjectRecord._id, {
      status: "completed",
    });

    // Create a Payment log record
    const paymentData = await Payment.create({
      transactionId: paymentInfo.decodedData.transaction_code,
      projectId: fundedProjectRecord.project,
      amount: fundedProjectRecord.totalPrice,
      dataFromVerificationReq: paymentInfo,
      paymentGateway: "esewa",
      status: "success",
    });

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
        dataFromVerificationReq: paymentData.dataFromVerificationReq,
        _id: paymentData._id,
        createdAt: paymentData.createdAt,
      },
    };

    // Determine frontend redirect target (can be passed by caller)
    const redirectTo = req.query.redirect || `${FRONTEND_URL}/payment-result`;
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
      error: error.message || error,
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    const redirectTo = req.query.redirect || `${FRONTEND_URL}/payment-result`;
    const sep = redirectTo.includes("?") ? "&" : "?";
    return res.redirect(
      `${redirectTo}${sep}data=${encodeURIComponent(encoded)}`
    );
  }
};
