// Test utility to debug Cloudinary URL signing
// Add this as a test endpoint in your routes

import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_SECRET,
} from "../config/env.js";

export const debugCloudinaryUrl = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: "URL parameter required" });
    }

    const results = {
      originalUrl: url,
      config: {
        cloudName: CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!CLOUDINARY_API_KEY,
        hasApiSecret: !!CLOUDINARY_API_SECRET,
      },
      parsed: {},
      attempts: [],
    };

    // Parse the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    results.parsed = {
      hostname: urlObj.hostname,
      pathParts: pathParts,
    };

    // Extract components
    let idx = 1; // Skip cloud name
    const resourceType = pathParts[idx++] || "image";
    const deliveryType = pathParts[idx++] || "upload";
    
    if (pathParts[idx] && pathParts[idx].match(/^v\d+$/)) {
      idx++;
    }
    
    const remainingPath = pathParts.slice(idx).join('/');
    const pathWithExtension = remainingPath.split('?')[0];

    results.parsed.resourceType = resourceType;
    results.parsed.deliveryType = deliveryType;
    results.parsed.pathWithExtension = pathWithExtension;

    // Try different public_id formats
    const attempts = [
      { name: "With extension", publicId: pathWithExtension },
      { name: "Without extension", publicId: pathWithExtension.replace(/\.[^/.]+$/, "") },
    ];

    for (const attempt of attempts) {
      try {
        const signedUrl = cloudinary.url(attempt.publicId, {
          resource_type: resourceType,
          type: deliveryType,
          secure: true,
          sign_url: true,
        });

        attempt.signedUrl = signedUrl;
        attempt.success = true;

        // Extract signature from URL
        const sigMatch = signedUrl.match(/s--([^/]+)--/);
        attempt.signature = sigMatch ? sigMatch[1] : "not found";

      } catch (error) {
        attempt.error = error.message;
        attempt.success = false;
      }
      
      results.attempts.push(attempt);
    }

    // Also try using cloudinary.uploader.explicit to check if resource exists
    try {
      const publicIdNoExt = pathWithExtension.replace(/\.[^/.]+$/, "");
      const resourceInfo = await cloudinary.api.resource(publicIdNoExt, {
        resource_type: resourceType,
        type: deliveryType,
      });
      
      results.resourceExists = true;
      results.resourceInfo = {
        publicId: resourceInfo.public_id,
        format: resourceInfo.format,
        resourceType: resourceInfo.resource_type,
        type: resourceInfo.type,
        secure_url: resourceInfo.secure_url,
      };
    } catch (error) {
      results.resourceExists = false;
      results.resourceCheckError = error.message;
    }

    return res.json(results);

  } catch (error) {
    console.error("Debug error:", error);
    return res.status(500).json({ 
      error: "Debug failed",
      details: error.message,
      stack: error.stack,
    });
  }
};

// Simple test to verify credentials
export const testCloudinaryConfig = async (req, res) => {
  try {
    const result = {
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKeyConfigured: !!CLOUDINARY_API_KEY,
      apiSecretConfigured: !!CLOUDINARY_API_SECRET,
      apiKeyLength: CLOUDINARY_API_KEY?.length || 0,
      apiSecretLength: CLOUDINARY_API_SECRET?.length || 0,
    };

    // Try to ping Cloudinary API
    try {
      const pingResult = await cloudinary.api.ping();
      result.apiAccessible = true;
      result.pingResult = pingResult;
    } catch (error) {
      result.apiAccessible = false;
      result.pingError = error.message;
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};