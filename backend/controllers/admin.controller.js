import User from "../models/user.model.js";
import Project from "../models/project.model.js";

export const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    res.status(200).json({ success: true, userCount, projectCount });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};