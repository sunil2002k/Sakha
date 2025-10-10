import mongoose from "mongoose";
import Project from "../models/project.model.js";

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
      createdAt,
      addedBy,
    } = req.body;

    const project = new Project({
      title,
      description,
      tech_stack,
      category,
      expected_outcomes,
      type,
      targetAmount,
      createdAt,
      addedBy,
    });

    const savedProject = await project.save();

    res
      .status(201)
      .json({ message: "Project saved successfully", project: savedProject });
  } catch (error) {
    console.error("Error saving product:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const show_project = async (req, res) => {
  try {
    const projects = await Project.find();
    res.send({ message: "success", projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).send({ message: "server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project details",
      error: error.message,
    });
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
