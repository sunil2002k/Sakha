import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

const connectToDatabase = async () => {
  if (!DB_URI) {
    throw new Error("DB_URI must be configured before starting the server");
  }

  await mongoose.connect(DB_URI);
  console.log(`Connected to database in ${NODE_ENV} mode`);
};

export default connectToDatabase;