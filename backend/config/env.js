import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

// Export all env vars
export const PORT = process.env.PORT || 5500;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/sakha";

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || "mysecret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "3d";

// Esewa
export const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "";
export const ESEWA_GATEWAY_URL = process.env.ESEWA_GATEWAY_URL || "";
export const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "";

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

// Stream
export const STREAM_API_KEY = process.env.STREAM_API_KEY || "";
export const STREAM_SECRET_KEY = process.env.STREAM_SECRET_KEY || "";
