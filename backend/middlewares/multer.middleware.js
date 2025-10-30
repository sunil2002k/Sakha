// multer.middleware.js

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve __filename and __dirname equivalents for ES Modules
const __filename = fileURLToPath(import.meta.url);
// Assuming 'public' is one level up from the 'middlewares' folder
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Define the ABSOLUTE path to the temporary storage folder.
const TEMP_DIR = path.join(projectRoot, "public", "temp");

// --- changed code: ensure temp dir exists and use safe unique filenames ---
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMP_DIR);
  },
  filename: function (req, file, cb) {
    // create a safe unique filename to avoid collisions and invalid names
    const ext = path.extname(file.originalname) || "";
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${base}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
});
