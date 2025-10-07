import express from "express";
import cors from 'cors';
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.routes.js";


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use("/api/v1/auth", authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/projects',projectRouter);


app.use(errorMiddleware);


app.get("/", (req, res) => {
  res.send("Welcome to the Sakha API");
});

app.listen(PORT, async()=>{
    console.log(`The app is running in port ${PORT}`);
    await connectToDatabase();
})

export default app;