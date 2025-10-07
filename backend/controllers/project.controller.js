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
    } = req.body;

    const addedBy = req.body.userId;

    const project = new Project({
      title,
      description,
      tech_stack,
      category,
      expected_outcomes,
      type,
      targetAmount,
      createdAt,
      addedBy
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
