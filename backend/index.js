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
import { attachSocketAuth, injectIoToRequests } from "./middlewares/socket.middleware.js";
import { registerSocketHandlers } from "./controllers/socket.controller.js";
import socketRouter from "./routes/socket.routes.js";


const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173","https://3ab2ca6b9358.ngrok-free.app","https://1cdeea281793.ngrok-free.app"
    ],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
// app.use((req, res, next) => {
//   res.setHeader("ngrok-skip-browser-warning", "true");
//   next();
// });


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
