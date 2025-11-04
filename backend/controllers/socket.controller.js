import Project from "../models/project.model.js";


export function registerSocketHandlers(io) {
  // runtime state
  const roomPending = new Map();
  const socketUserMap = new Map();

  io.on("connection", async (socket) => {
    console.log(`A user connected: ${socket.id}`);

    let currentRoomId = null;
    const userId = socket.handshake?.auth?.userId || "UNAUTHENTICATED";
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
          if (s.handshake?.auth?.userId && String(s.handshake.auth.userId) === addedBy) {
            ownerSocketId = id;
            break;
          }
        }

        const roomSockets = io.sockets.adapter.rooms.get(projectId);
        const numClients = roomSockets ? roomSockets.size : 0;

        // Owner joins immediately
        if (String(userId) === addedBy) {
          socket.join(projectId);
          currentRoomId = projectId;
          console.log(`Owner ${userId} joined room ${projectId}`);
          socket.emit("user-ready", "Owner joined");
          const pend = roomPending.get(projectId) || [];
          if (pend.length > 0 && ownerSocketId) {
            io.to(ownerSocketId).emit("mentor-pending-list", pend);
          }
          return;
        }

        // Mentor workflow (not owner)
        if (numClients >= 2) {
          socket.emit("room-full");
          return socket.disconnect(true);
        }

        const pending = roomPending.get(projectId) || [];
        pending.push({ socketId: socket.id, userId });
        roomPending.set(projectId, pending);

        if (ownerSocketId) {
          io.to(ownerSocketId).emit("mentor-request", { socketId: socket.id, userId });
          socket.emit("waiting-for-approval");
        } else {
          socket.emit("waiting-for-owner");
        }
      } catch (error) {
        console.error(`Error joining room ${projectId}:`, error);
        socket.emit("error", "Failed to join video room.");
        socket.disconnect(true);
      }
    });

    socket.on("approve-mentor", async ({ projectId, socketId, approve }) => {
      try {
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
        pending.splice(idx, 1);
        roomPending.set(projectId, pending);

        const targetSocket = io.sockets.sockets.get(socketId);
        if (!targetSocket) {
          socket.emit("error", "Mentor disconnected before approval.");
          return;
        }

        if (!approve) {
          targetSocket.emit("mentor-rejected");
          targetSocket.disconnect(true);
          return;
        }

        const roomSockets = io.sockets.adapter.rooms.get(projectId);
        const numClients = roomSockets ? roomSockets.size : 0;
        if (numClients >= 2) {
          targetSocket.emit("room-full");
          targetSocket.disconnect(true);
          return;
        }

        targetSocket.join(projectId);
        io.to(socketId).emit("mentor-approved", { projectId, by: addedBy });
        socket.to(projectId).emit("user-joined", socketId);
        socket.emit("user-ready", "Mentor approved and connected.");
      } catch (err) {
        console.error("Error in approve-mentor:", err);
      }
    });

    // WebRTC signaling relay
    socket.on("offer", (offer) => {
      if (currentRoomId) socket.to(currentRoomId).emit("offer", offer);
    });
    socket.on("answer", (answer) => {
      if (currentRoomId) socket.to(currentRoomId).emit("answer", answer);
    });
    socket.on("ice-candidate", (candidate) => {
      if (currentRoomId) socket.to(currentRoomId).emit("ice-candidate", candidate);
    });

    socket.on("disconnect", () => {
      for (const [projectId, pendingArr] of roomPending.entries()) {
        const newArr = pendingArr.filter((p) => p.socketId !== socket.id);
        if (newArr.length !== pendingArr.length) roomPending.set(projectId, newArr);
      }
      socketUserMap.delete(socket.id);

      if (currentRoomId) {
        console.log(`User ${userId} (Socket ID: ${socket.id}) left room ${currentRoomId}`);
        socket.to(currentRoomId).emit("partner-left");
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // return runtime state so HTTP routes can inspect/manage rooms/pending lists
  return { roomPending, socketUserMap };
}