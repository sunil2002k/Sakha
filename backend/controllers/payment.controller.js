import Funding from "../models/funding.model.js";
import FundedProject from "../models/fundedProject.model.js";
import Payment from "../models/payment.model.js";
import { esewaPaymentHash, verifyEsewa } from "../utils/esewa.js";

import Project from "../models/Project.model.js";

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { projectId, amount } = req.body;

    // ✅ Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // ✅ Create funded record
    const fundedProject = await FundedProject.create({
      project: projectId,
      amount,
      totalPrice: amount,
      paymentMethod: "esewa",
      status: "pending",
    });

    // ✅ Generate hash for eSewa
    const paymentInit = await esewaPaymentHash({
      amount,
      transaction_uuid: fundedProject._id.toString(),
    });

    res.status(200).json({
      success: true,
      signature: paymentInit.signature,
      signed_field_names: paymentInit.signed_field_names,
      transaction_uuid: fundedProject._id.toString(), // ✅ Add the UUID to the response
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate payment" });
  }
};

/**
 * @desc Verify payment after success
 */
// payment.controller.js - completeEsewaPayment

export const completeEsewaPayment = async (req, res) => {
  const { data } = req.query;

  try {
    const paymentInfo = await verifyEsewa(data);

    // 1. Find the FundedProject record using the transaction_uuid (which is the _id of the FundedProject document)
    const fundedProjectRecord = await FundedProject.findById(
      paymentInfo.response.transaction_uuid
    );
    if (!fundedProjectRecord) {
      return res.status(404).json({
        success: false,
        message:
          "FundedProject record not found corresponding to transaction_uuid", // 💡 Clearer error
      });
    }

    // 2. Update the FundedProject status to 'completed'.
    // Note: The previous attempt to update Funding was already accomplished by FundedProject.findByIdAndUpdate(fundedProjectRecord._id, ...) above, but it was being executed twice on the same model and was missing the 'funding' variable here.
    // The previous update was correct: await FundedProject.findByIdAndUpdate(fundedProjectRecord._id, { status: "completed" });
    // Let's ensure the single update is placed correctly and that there's no attempt to update the Funding model.
    await FundedProject.findByIdAndUpdate(fundedProjectRecord._id, {
      status: "completed",
    });
    // The line below should be removed or commented out as it's redundant (update already done) and uses undefined variables and the wrong model (Funding).
    /*
    await Funding.findByIdAndUpdate(funding._id, { status: "completed" }); // ❌ THIS LINE CAUSED THE ERROR
    */

    // 3. Create a Payment log record
    const paymentData = await Payment.create({
      transactionId: paymentInfo.decodedData.transaction_code, // Use eSewa's transaction_code
      projectId: fundedProjectRecord.project, // Use the project ID from the FundedProject record
      amount: fundedProjectRecord.totalPrice, // Use totalPrice as it's the required amount, simplifying the OR logic.
      dataFromVerificationReq: paymentInfo,
      paymentGateway: "esewa",
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Payment successful",
      paymentData,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error,
    });
  }
};
