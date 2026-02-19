import express from "express";
import cloudinaryController from "../controllers/cloudinary.controller.js";
import { debugCloudinaryUrl, testCloudinaryConfig } from "../controllers/cloudinary.debug.js";


const cloudinaryRouter = express.Router();

// GET /api/v1/cloudinary/signed-url?url=<secure_url>
cloudinaryRouter.get("/signed-url", cloudinaryController.getSignedUrl);
// GET /api/v1/cloudinary/download?url=<secure_url> or ?public_id=<id>
cloudinaryRouter.get("/download", cloudinaryController.getDownload);
cloudinaryRouter.get("/debug", debugCloudinaryUrl);
cloudinaryRouter.get("/test-config", testCloudinaryConfig);

export default cloudinaryRouter;
