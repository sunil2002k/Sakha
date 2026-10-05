import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";

const authorize = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : null;
    const token = req.cookies?.jwt || bearerToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn("JWT verify failed:", err?.message || err);
      res.clearCookie("jwt");
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (user.isBanned) {
      res.clearCookie("jwt");
      return res.status(403).json({ message: "Account suspended" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authorize middleware:", error?.message || error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default authorize;


// 🟢 NEW: Admin-only check
export const isAdmin = (req, res, next) => {
  // Check if req.user exists (from authorize) and if they are an admin
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Admins only." 
    });
  }
};

// 🟢 NEW: Mentor-only check (Optional)
export const isMentor = (req, res, next) => {
  if (req.user && (req.user.role === "mentor" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Mentors only." 
    });
  }
};
