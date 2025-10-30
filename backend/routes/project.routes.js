import { Router } from "express";
import {
  create_project,
  show_project,
  getProjectById,
  searchProjects,
} from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import authorize from "../middlewares/auth.middleware.js";

const projectRouter = Router();

// require auth so req.user is populated, then multer saves files
projectRouter.post(
  "/create-project",
  authorize,
  upload.array("images", 5),
  create_project
);
projectRouter.get("/search", searchProjects);
projectRouter.get("/showproject", show_project);
projectRouter.get("/:id", getProjectById);

projectRouter.put("/:id", (req, res) => {
  res.send({ title: "update projects" });
});

projectRouter.delete("/:id", (req, res) => {
  res.send({ title: "delete all the projects" });
});

projectRouter.get("/user/:id", (req, res) => {
  res.send({ title: "get all the user projects" });
});

projectRouter.put("/:id/cancel", (req, res) => {
  res.send({ title: "update  the specific projects" });
});

projectRouter.get("/upcoming-renewals", (req, res) => {
  res.send({ title: "get all the projects" });
});

export default projectRouter;
