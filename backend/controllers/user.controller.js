import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";
import jwt from 'jsonwebtoken';

export const getUsers= async (req, res, next)=>{
    try{
        const users = await User.find();

        res.status(200).json({success: true, data: users})
    }
    catch(error){
        next(error);
    }
}

export const getUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};


// export const getUser = async (req, res, next) => {
//   try {
//     const { id } = req.params; // extract id from URL

//     const user = await User.findById(id).select("-password"); // exclude password field

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "User fetched successfully",
//       data: user,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id.trim();
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error });
  }
}