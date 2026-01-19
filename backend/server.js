import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRouter from "./src/routes/authroutes.js";
import complaintRouter from "./src/routes/complaintRoutes.js";
import supportRouter from "./src/routes/supportRoutes.js";
import staffRouter from "./src/routes/staffroutes.js";
import adminRouter from "./src/routes/adminroutes.js";
import getlocation from "./src/routes/geocode.js";
import { multerErrorHandler } from "./src/middleware/errorhandler.js";

const app = express();
const isProd = process.env.NODE_ENV === "production";

/* =======================
   TRUST PROXY (Render)
======================= */
if (isProd) {
  app.set("trust proxy", 1);
}

/* =======================
   SECURITY
======================= */
app.use(helmet());

/* =======================
   CORS (LOCAL + PROD)
======================= */
const allowedOrigins = [
  process.env.FRONT_END_URL, // local or prod
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true,
}));

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(cookieParser());

/* =======================
   FILE SYSTEM (LOCAL SAFE)
======================= */
const uploadsDir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static("uploads"));

/* =======================
   ROUTES
======================= */
app.use("/api/geocode", getlocation);
app.use("/api/auth", authRouter);
app.use("/api/complaints", complaintRouter);
app.use("/api/support", supportRouter);
app.use("/api/staff", staffRouter);
app.use("/api/admin", adminRouter);

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.send("API WORKING");
});

/* =======================
   ERRORS
======================= */
app.use(multerErrorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: !isProd ? err.message : undefined,
  });
});

/* =======================
   DATABASE + SERVER
======================= */
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
