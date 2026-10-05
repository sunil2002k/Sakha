import { upsertStreamUser } from "../utils/stream.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../config/env.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export async function signUp(req, res) {
  try {
    const { email, password, fullName, role } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof fullName !== "string" ||
      !email.trim() ||
      !password ||
      !fullName.trim()
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role && !["student", "mentor"].includes(role)) {
      return res.status(400).json({ message: "Invalid account role" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = fullName.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a different one" });
    }

    const randomSeed = Math.random().toString(36).substring(7);
  const diceBearAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`;

    const newUser = await User.create({
      email: normalizedEmail,
      fullName: normalizedFullName,
      password,
      profilePic: diceBearAvatar,
      role: role || "student",
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.warn("Error creating Stream user:", error?.message || error);
    }

    const token = jwt.sign({ userId: newUser._id.toString() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: NODE_ENV === "production" ? "strict" : "lax",
      secure: NODE_ENV === "production",
    });

    const userObj = newUser.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, user: userObj, token });
  } catch (error) {
    console.error("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function signIn(req, res) {
  try {
    const { email: submittedEmail, password } = req.body || {};

    if (typeof submittedEmail !== "string" || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const email = submittedEmail.trim().toLowerCase();
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
      });
    }

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: NODE_ENV === "production" ? "strict" : "lax",
      secure: NODE_ENV === "production",
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, user: userObj, token });
  } catch (error) {
    console.error("Error in login controller", error?.message || error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function signOut(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updateData = {
      fullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      isOnboarded: true,
    };

    if (profilePic) {
      updateData.profilePic = profilePic;
    }

    if (req.file && req.user.role === "mentor") {
      try {
        const uploadResponse = await uploadOnCloudinary(req.file.path, {
          resource_type: "raw",
          folder: "resumes",
          use_filename: true,
          unique_filename: true,
        });

        if (uploadResponse) {
          updateData.resume = uploadResponse.secure_url;
          updateData.resumeResourceType = uploadResponse.resource_type;
        }
      } catch (error) {
        console.error("Error uploading resume to Cloudinary:", error);
        return res.status(500).json({ message: "Failed to upload resume to Cloudinary" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.warn("Error updating Stream user during onboarding:", streamError?.message || streamError);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}