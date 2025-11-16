import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import {
  attachSocketAuth,
  injectIoToRequests,
} from "./middlewares/socket.middleware.js";
import { registerSocketHandlers } from "./controllers/socket.controller.js";
import socketRouter from "./routes/socket.routes.js";

const app = express();

// DEVELOPMENT: allow any origin for dev (restrict in production)
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/payments", paymentRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the Sakha API");
});

// --- 1. HTTP Server Setup ---
const httpServer = createServer(app);

// --- 2. Socket.IO Initialization ---
// Socket.IO: allow all origins in dev (or set to exact FRONTEND URL in production)
const io = new Server(httpServer, {
  cors: { origin: true, methods: ["GET", "POST"], credentials: true },
});

// attach optional handshake auth
attachSocketAuth(io);

// register handlers returned state
const socketState = registerSocketHandlers(io);

// make io and socket state available to express routes
app.set("io", io);
app.set("socketState", socketState);

// mount admin/socket routes
app.use("/api/v1/socket", injectIoToRequests, socketRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 4. Start Server ---
httpServer.listen(PORT, async () => {
  console.log(`The app is running in port ${PORT}`);
  await connectToDatabase();
});
