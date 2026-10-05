import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

// Export all env vars
export const PORT = process.env.PORT || 5500;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DB_URI =
  process.env.DB_URI ||
  (NODE_ENV === "production" ? "" : "mongodb://localhost:27017/sakha");
export const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  (NODE_ENV === "production"
    ? "https://sakha-peach.vercel.app"
    : "http://localhost:5173")
).replace(/\/+$/, "");
export const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGINS || FRONTEND_URL
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// JWT
const configuredJwtSecret = process.env.JWT_SECRET;
if (NODE_ENV === "production" && !configuredJwtSecret) {
  throw new Error("JWT_SECRET must be configured in production");
}
export const JWT_SECRET = configuredJwtSecret || "mysecret";
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

// Email
export const EMAIL_USER = process.env.EMAIL_USER || "";
export const EMAIL_PASS = process.env.EMAIL_PASS || "";