import { Router } from "express";
import {
  create_project,
  show_project,
  getProjectById,
  searchProjects,
  getMyProjects,
  postProjectUpdate
} from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import authorize from "../middlewares/auth.middleware.js";

const projectRouter = Router();


projectRouter.post(
  "/create-project",
  authorize,
  upload.array("images", 5),
  create_project
);
projectRouter.get("/search", searchProjects);
projectRouter.get("/showproject", show_project);
projectRouter.get("/my-projects", authorize, getMyProjects);
projectRouter.post("/:id/updates", authorize, postProjectUpdate);
projectRouter.get("/:id", getProjectById);



export default projectRouter;
