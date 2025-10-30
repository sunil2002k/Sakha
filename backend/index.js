// index.js

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

import Project from "./models/project.model.js";
// import { create_project } from "./controllers/project.controller.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// app.options('*', cors());

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
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- 3. Socket.IO Signaling Logic ---
const roomPending = new Map();
const socketUserMap = new Map();

io.on("connection", async (socket) => {
  console.log(`A user connected: ${socket.id}`);

  let currentRoomId = null;
  let userId = "UNAUTHENTICATED"; // Default value

  // 💡 Auth Check: Extract user ID from token or handshake if available
  if (socket.handshake.auth && socket.handshake.auth.userId) {
    userId = socket.handshake.auth.userId;
  }
  socketUserMap.set(socket.id, userId);

  socket.on("join-room", async (projectId) => {
    if (!projectId) return;

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        socket.emit("error", "Project not found.");
        return socket.disconnect(true);
      }

      const addedBy = String(project.addedBy);

      // helper: find owner socket if connected
      let ownerSocketId = null;
      for (const [id, s] of io.sockets.sockets) {
        if (
          s.handshake?.auth?.userId &&
          String(s.handshake.auth.userId) === addedBy
        ) {
          ownerSocketId = id;
          break;
        }
      }

      const roomSockets = io.sockets.adapter.rooms.get(projectId);
      const numClients = roomSockets ? roomSockets.size : 0;

      // If user is the owner -> join immediately
      if (String(userId) === addedBy) {
        socket.join(projectId);
        currentRoomId = projectId;
        console.log(`Owner ${userId} joined room ${projectId}`);

        // notify owner and any approved partner
        socket.emit("user-ready", "Owner joined");
        // If there are pending requests, forward them to owner
        const pend = roomPending.get(projectId) || [];
        if (pend.length > 0 && ownerSocketId) {
          io.to(ownerSocketId).emit("mentor-pending-list", pend);
        }
        return;
      }

      // If user is NOT owner -> handle mentor request workflow
      // Reject if room already has 2 participants (guard)
      if (numClients >= 2) {
        socket.emit("room-full");
        return socket.disconnect(true);
      }

      // Add to pending list (do NOT join yet)
      const pending = roomPending.get(projectId) || [];
      pending.push({ socketId: socket.id, userId });
      roomPending.set(projectId, pending);

      // If owner is online, notify owner to approve/reject
      if (ownerSocketId) {
        io.to(ownerSocketId).emit("mentor-request", {
          socketId: socket.id,
          userId,
        });
        socket.emit("waiting-for-approval");
      } else {
        // Owner offline: notify the requester and keep in pending
        socket.emit("waiting-for-owner");
      }
    } catch (error) {
      console.error(`Error joining room ${projectId}:`, error);
      socket.emit("error", "Failed to join video room.");
      socket.disconnect(true);
    }
  });

  // Owner approves/rejects a mentor
  socket.on("approve-mentor", async ({ projectId, socketId, approve }) => {
    try {
      // verify that the approver is the project owner
      const project = await Project.findById(projectId);
      if (!project) return;
      const addedBy = String(project.addedBy);
      const approverId = socketUserMap.get(socket.id);
      if (String(approverId) !== addedBy) {
        socket.emit("error", "Only the project owner can approve mentors.");
        return;
      }

      const pending = roomPending.get(projectId) || [];
      const idx = pending.findIndex((p) => p.socketId === socketId);
      if (idx === -1) return;

      const req = pending[idx];
      // remove from pending
      pending.splice(idx, 1);
      roomPending.set(projectId, pending);

      const targetSocket = io.sockets.sockets.get(socketId);
      if (!targetSocket) {
        // target disconnected
        socket.emit("error", "Mentor disconnected before approval.");
        return;
      }

      if (!approve) {
        targetSocket.emit("mentor-rejected");
        targetSocket.disconnect(true);
        return;
      }

      // final room size guard
      const roomSockets = io.sockets.adapter.rooms.get(projectId);
      const numClients = roomSockets ? roomSockets.size : 0;
      if (numClients >= 2) {
        targetSocket.emit("room-full");
        targetSocket.disconnect(true);
        return;
      }

      // approve: join the mentor to the room
      targetSocket.join(projectId);
      io.to(socketId).emit("mentor-approved", { projectId, by: addedBy });
      // notify existing room member(s)
      socket.to(projectId).emit("user-joined", socketId);
      socket.emit("user-ready", "Mentor approved and connected.");
    } catch (err) {
      console.error("Error in approve-mentor:", err);
    }
  });

  // Relay offer/answer/ice as before (unchanged)
  socket.on("offer", (offer) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit("offer", offer);
    }
  });

  socket.on("answer", (answer) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit("answer", answer);
    }
  });

  socket.on("ice-candidate", (candidate) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit("ice-candidate", candidate);
    }
  });

  socket.on("disconnect", () => {
    // cleanup pending entries
    for (const [projectId, pendingArr] of roomPending.entries()) {
      const newArr = pendingArr.filter((p) => p.socketId !== socket.id);
      if (newArr.length !== pendingArr.length)
        roomPending.set(projectId, newArr);
    }
    socketUserMap.delete(socket.id);

    if (currentRoomId) {
      console.log(
        `User ${userId} (Socket ID: ${socket.id}) left room ${currentRoomId}`
      );
      socket.to(currentRoomId).emit("partner-left");
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 4. Start Server ---
httpServer.listen(PORT, async () => {
  console.log(`The app is running in port ${PORT}`);
  await connectToDatabase();
});
