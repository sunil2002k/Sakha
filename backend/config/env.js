import { config } from "dotenv";

config({path:`.env.${process.env.NODE_ENV || 'development'}.local`})

export const {
    PORT, NODE_ENV,
    DB_URI, 
    JWT_SECRET,JWT_EXPIRES_IN,
    ESEWA_SECRET_KEY,ESEWA_GATEWAY_URL,ESEWA_PRODUCT_CODE, 
    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET,
    STREAM_API_KEY,STREAM_SECRET_KEY
}= process.env;