import { Router } from "express";

const router = Router();

// GET /api/v1/socket/status
router.get("/status", (req, res) => {
  const io = req.io;
  if (!io) return res.status(500).json({ ok: false, message: "Socket.IO not initialized" });

  const rooms = Array.from(io.sockets.adapter.rooms.keys());
  return res.json({ ok: true, roomsCount: rooms.length, rooms });
});

// GET /api/v1/socket/rooms/:id/pending
router.get("/rooms/:id/pending", (req, res) => {
  const state = req.socketState;
  if (!state) return res.status(500).json({ ok: false, message: "Socket state not available" });

  const pending = state.roomPending.get(req.params.id) || [];
  return res.json({ ok: true, pending });
});

export default router;