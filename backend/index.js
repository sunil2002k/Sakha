import express from "express";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import connectToDatabase from "./database/mongodb.js";


const app = express()

app.use('/api/v1/users',userRouter);
app.use('/api/v1/projects',projectRouter);


app.get("/", (req, res) => {
  res.send("Welcome to the Sakha API");
});

app.listen(PORT, async()=>{
    console.log(`The app is running in port ${PORT}`);
    await connectToDatabase();
})