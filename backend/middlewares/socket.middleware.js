import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";


export function attachSocketAuth(io) {
  io.use((socket, next) => {
    try {
      const { token, userId } = socket.handshake.auth || {};
      if (token) {
        // verify token and populate handshake.user if valid
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.handshake.auth.userId = decoded.userId || userId || socket.handshake.auth.userId;
      } else if (userId) {
        socket.handshake.auth.userId = userId;
      }
      return next();
    } catch (err) {
      console.warn("Socket auth failed:", err.message);
      return next(new Error("Authentication error"));
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