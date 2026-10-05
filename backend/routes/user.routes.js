import express from "express";
import {
  getUsers,
  getUserById,
  getFriendRequests,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
} from "../controllers/user.controller.js";
import authorize, {isAdmin} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Full user records are available only to administrators.
router.get("/", authorize, isAdmin, getUsers);

// Protected user-related routes 
router.get("/friend-requests", authorize, getFriendRequests);
router.get("/outgoing-friend-requests", authorize, getOutgoingFriendReqs);
router.get("/friends", authorize, getMyFriends);
router.get("/recommended", authorize, getRecommendedUsers);

// Friend request actions
router.post("/friend-request/:id", authorize, sendFriendRequest);
router.put("/friend-request/:id/accept", authorize, acceptFriendRequest);

// Single user by id – keep this LAST so it doesn't catch "friend-requests"
router.get("/:id", getUserById);

export default router;
