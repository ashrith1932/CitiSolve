import express from "express";
import isAuthenticated from "../middleware/authmiddleware.js";
import citizencontrollers from "../controllers/citizencontrollers.js";
import multer from "multer";

const upload = multer();
const router = express.Router();

// app.js or server.js
import { multerErrorHandler } from './middleware/errorHandler.js';

// ... your routes ...
// Submit a new complaint (Citizen only)
complaintRouter.post(
  '/submit', 
  verifyToken,
  citizenAuth,
  upload.array('images', 5),  // ✅ ADD THIS for image upload
  submitComplaint
);

// Get all complaints by logged-in citizen
complaintRouter.get(
  '/my-complaints', 
  verifyToken,
  citizenAuth,
  getMyCitizensComplaints
);

// Get single complaint by ID (Citizen - own complaints only)
complaintRouter.get(
  '/:id', 
  verifyToken,
  citizenAuth,
  getComplaintById
);

app.use(multerErrorHandler); // ← Add after routes