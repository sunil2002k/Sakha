import mongoose from "mongoose";
import Project from "../models/project.model.js";
// project.controller.js
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import path from "path";

export const create_project = async (req, res) => {
  try {
    const {
      title,
      description,
      tech_stack,
      category,
      expected_outcomes,
      type,
      targetAmount,
    } = req.body;

    const addedBy = req.user?._id || req.body.addedBy;
    if (!addedBy) {
      return res.status(401).json({
        success: false,
        message: "addedBy (authenticated user) is required",
      });
    }

    const localFiles = Array.isArray(req.files) ? req.files : [];
    const images = [];

    for (const file of localFiles) {
      const cloudinaryResponse = await uploadOnCloudinary(file.path);

      if (cloudinaryResponse) {
        images.push(cloudinaryResponse.secure_url);
      } else {
        console.warn(`Failed to upload file: ${file.originalname}`);
      }
    }

    const project = new Project({
      title,
      description,
      tech_stack,
      category,
      expected_outcomes,
      type,
      targetAmount: targetAmount ? Number(targetAmount) : undefined,
      images,
      addedBy,
    });

    const savedProject = await project.save();
    res.status(201).json({
      success: true,
      message: "Project saved successfully",
      project: savedProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    const msg = error?.errors
      ? Object.values(error.errors)
          .map((e) => e.message)
          .join(", ")
      : error.message;
    res
      .status(500)
      .json({ success: false, message: "Error creating project", error: msg });
  }
};

// show list (populate addedBy)
export const show_project = async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate("addedBy", "name email"); // <-- populate name and email
    return res.status(200).json({ message: "success", projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// get single project by id (populate addedBy)
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate(
      "addedBy",
      "name email"
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.status(200).json({ project });
  } catch (error) {
    console.error("Error fetching project by id:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const searchProjects = async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const results = await Project.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tech_stack: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ projects: results });
  } catch (error) {
    console.error("Error during search:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
