import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_SECRET,
} from "../config/env.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary.
 *
 * @param {string} localFilePath  - Temp path written by multer (e.g. /tmp/abc123)
 * @param {object} [options]      - Extra Cloudinary upload options
 *                                  e.g. { resource_type: "raw", folder: "resumes" }
 * @returns {Promise<object|null>} Cloudinary upload response or null on failure
 *
 * IMPORTANT: Pass { resource_type: "raw" } when uploading PDFs/documents.
 * Using the default "image" resource_type for a PDF will cause 401 errors
 * when trying to generate a signed URL for preview or download later.
 */
export const uploadOnCloudinary = async (localFilePath, options = {}) => {
  if (!localFilePath) return null;

  try {
    const uploadOptions = {
      resource_type: "auto", // default: let Cloudinary detect the type
      ...options,            // caller can override with { resource_type: "raw" }
    };

    const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);

    // Remove the temp file after a successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Always clean up the temp file even on failure
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (cleanupError) {
      console.warn("Failed to clean up temp file:", cleanupError.message);
    }

    return null;
  }
};

export default cloudinary;