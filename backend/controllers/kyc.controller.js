import { KYCModel } from "../models/kyc.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.model.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sendEmail } from "../utils/email.service.js";

// Resolve __filename and __dirname equivalents for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const TEMP_DIR = path.join(projectRoot, "public", "temp");

export const submitKYC = async (req, res) => {
  try {
    const { fullName, dob, address, selfie, submittedBy } = req.body;
    const idCardFile = req.file;

    // 1. Validation
    if (!idCardFile)
      return res.status(400).json({ error: "ID Card image is required." });
    if (!selfie)
      return res.status(400).json({ error: "Selfie capture is required." });
    if (!submittedBy)
      return res
        .status(400)
        .json({ error: "User ID (submittedBy) is required." });

    // 2. Upload ID Card to Cloudinary
    const idCardResponse = await uploadOnCloudinary(idCardFile.path);
    if (!idCardResponse) {
      return res
        .status(500)
        .json({ error: "Failed to upload ID Card to Cloudinary" });
    }
    const selfieFilename = `selfie-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.jpg`;
    const selfieTempPath = path.join(TEMP_DIR, selfieFilename);

    // Remove the data URL prefix and save to temp disk
    const base64Data = selfie.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(selfieTempPath, base64Data, "base64");

    // Upload Selfie to Cloudinary
    const selfieResponse = await uploadOnCloudinary(selfieTempPath);
    if (!selfieResponse) {
      return res
        .status(500)
        .json({ error: "Failed to upload Selfie to Cloudinary" });
    }

    // 4. Create Database Entry
    const newKYC = new KYCModel({
      fullName,
      dob,
      address,
      idCardUrl: idCardResponse.secure_url, // Store Cloudinary URL
      selfieUrl: selfieResponse.secure_url, // Store Cloudinary URL
      submittedBy,
    });

    await newKYC.save();

    console.log(`✅ KYC Submitted for: ${fullName} (User: ${submittedBy})`);

    res.status(201).json({
      message: "KYC submitted successfully",
      data: newKYC,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const show_KYC = async (req, res) => {
  try {
    const records = await KYCModel.find()
  .populate("submittedBy", "fullName email profilePic")
  .sort({ submittedAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || { };
    
    // Populate submittedBy to access User.email
    const record = await KYCModel.findById(id).populate("submittedBy");
    if (!record) return res.status(404).json({ success: false, message: "KYC not found" });

    record.status = "verified";
    await record.save();

    await User.findByIdAndUpdate(record.submittedBy._id, { isKYCverified: true });

    await sendEmail({
      email: record.submittedBy.email,
      subject: "KYC Verification Approved",
      message: `Your identity verification has been approved. ${reason || "You now have full access to platform features."}`
    });

    res.status(200).json({ success: true, message: "Verified and email sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    
    const record = await KYCModel.findById(id).populate("submittedBy");
    if (!record) return res.status(404).json({ success: false, message: "KYC not found" });

    record.status = "rejected";
    await record.save();

    await User.findByIdAndUpdate(record.submittedBy._id, { isKYCverified: false });

    await sendEmail({
      email: record.submittedBy.email,
      subject: "KYC Verification Rejected",
      message: `Your identity verification was rejected. Reason: ${reason || "The provided documents were unclear or invalid."}`
    });

    res.status(200).json({ success: true, message: "Rejected and email sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
