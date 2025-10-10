import { Router } from "express";
import {
  create_project,
  getProjectById,
  searchProjects,
  show_project,
} from "../controllers/project.controller.js";

const projectRouter = Router();

projectRouter.post("/create-project", create_project);

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
