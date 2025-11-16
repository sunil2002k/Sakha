import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export function attachSocketAuth(io) {
  io.use((socket, next) => {
    try {
      const { token, userId } = socket.handshake.auth || {};
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          socket.handshake.auth.userId =
            decoded.userId || userId || socket.handshake.auth.userId;
        } catch (verifyErr) {
          // don't reject connection in dev; log and fallback to provided userId if any
          console.warn("Socket token verify failed:", verifyErr.message);
          if (userId) socket.handshake.auth.userId = userId;
        }
      } else if (userId) {
        socket.handshake.auth.userId = userId;
      }
      // log handshake for debugging
      console.log("Socket handshake auth:", socket.handshake?.auth);
      return next();
    } catch (err) {
      console.warn("Socket auth unexpected error:", err?.message || err);
      // allow connection but mark unauthenticated
      socket.handshake.auth = socket.handshake.auth || {};
      socket.handshake.auth.userId =
        socket.handshake.auth.userId || "UNAUTHENTICATED";
      return next();
    }
  });
}

/**
 * Small Express middleware to expose io and socketState on req for routes that need them
 * Use as: app.use('/api/v1/socket', injectIoToRequests, socketRouter)
 */
export function injectIoToRequests(req, res, next) {
  req.io = req.app.get("io");
  req.socketState = req.app.get("socketState");
  next();
}
