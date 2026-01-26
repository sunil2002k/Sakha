import express from "express";
import {
  getUsers,
  getUserById,
  getFriendRequests,
  getOutgoingFriendReqs,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
} from "../controllers/user.controller.js";
import authorize, {isAdmin} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public or admin list
router.get("/", getUsers);

// Protected user-related routes 
router.get("/friend-requests", authorize, getFriendRequests);
router.get("/outgoing-friend-requests", authorize, getOutgoingFriendReqs);
router.get("/friends", authorize, getMyFriends);


// Friend request actions
router.post("/friend-request/:id", authorize, sendFriendRequest);
router.put("/friend-request/:id/accept", authorize, acceptFriendRequest);

// Single user by id – keep this LAST so it doesn't catch "friend-requests"
router.get("/:id", getUserById);

export default router;
