import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import chatRouter from "./routes/chat.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import kycRouter from "./routes/kyc.routes.js";
const app = express();

// DEVELOPMENT: allow any origin for dev (restrict in production)
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/kyc", kycRouter);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the Sakha API");
});



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 4. Start Server ---
app.listen(PORT, async () => {
  console.log(`The app is running in port ${PORT}`);
  await connectToDatabase();
});
