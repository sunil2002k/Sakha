import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_SECRET,
} from "../config/env.js";

/**
 * GET /cloudinary/download?url=<cloudinary_url>&download=true|false
 *
 * Generates a signed Cloudinary URL for previewing or downloading a file.
 *
 * "raw" resource types (PDFs, DOCX, etc.) do NOT support Cloudinary
 * transformations like fl_attachment. Adding that flag to a raw URL
 * causes a 400 error. For raw files we return a clean signed URL and
 * let the frontend trigger the download via blob fetch + <a download>.
 */
const getDownload = async (req, res) => {
  try {
    const { url, download } = req.query;

    if (!url) {
      return res.status(400).json({ error: "url query parameter is required" });
    }

    // Parse the Cloudinary URL
    // Pattern: https://res.cloudinary.com/<cloud>/<resource_type>/<delivery_type>/[v<ver>/]<public_id>
    const urlParts = url.split("/");

    const uploadIndex = urlParts.findIndex((p) =>
      ["upload", "private", "authenticated"].includes(p)
    );

    if (uploadIndex === -1) {
      return res.status(400).json({ error: "Invalid Cloudinary URL format" });
    }

    const resourceType = urlParts[uploadIndex - 1] || "image";
    const deliveryType = urlParts[uploadIndex];

    let pathParts = urlParts.slice(uploadIndex + 1);

    // Strip existing signature segment (e.g. "s--abc123--")
    if (pathParts.length > 0 && /^s--/.test(pathParts[0])) {
      pathParts.shift();
    }

    // Strip transformation segments (e.g. "fl_attachment:filename")
    while (pathParts.length > 0 && /^[a-z]+_/.test(pathParts[0])) {
      pathParts.shift();
    }

    // Strip version segment (e.g. "v1769938525")
    if (pathParts.length > 0 && /^v\d+$/.test(pathParts[0])) {
      pathParts.shift();
    }

    const publicId = pathParts.join("/");

    if (!publicId) {
      return res.status(400).json({ error: "Could not extract public ID from URL" });
    }

    const isDownload = download === "true";
    const filename = publicId.split("/").pop();

    console.log("Resource Type:", resourceType);
    console.log("Delivery Type:", deliveryType);
    console.log("Public ID:", publicId);
    console.log("Is Download:", isDownload);

    const urlOptions = {
      sign_url: true,
      secure: true,
      resource_type: resourceType,
      type: deliveryType,
    };

    // fl_attachment is a transformation — only valid for "image" and "video".
    // For "raw" files (PDFs, DOCX) do NOT add it — causes 400 error.
    // The frontend blob-download handles saving raw files instead.
    if (isDownload && resourceType !== "raw") {
      urlOptions.flags = `attachment:${filename}`;
    }

    const signedUrl = cloudinary.url(publicId, urlOptions);

    console.log("Generated Signed URL:", signedUrl);

    return res.json({ url: signedUrl, filename });
  } catch (error) {
    console.error("Cloudinary getDownload error:", error);
    return res.status(500).json({
      error: "Failed to generate signed URL",
      details: error.message,
    });
  }
};

const getSignedUrl = async (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      CLOUDINARY_API_SECRET
    );

    return res.json({
      signature,
      timestamp,
      apiKey: CLOUDINARY_API_KEY,
      cloudName: CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("getSignedUrl error:", error);
    return res.status(500).json({ error: "Failed to generate signature" });
  }
};

export default { getSignedUrl, getDownload };