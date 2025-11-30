import express from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { getStreamToken } from '../controllers/chat.controller.js';

const chatRouter = express.Router();

chatRouter.get("/token", authorize,
getStreamToken);

export default chatRouter;