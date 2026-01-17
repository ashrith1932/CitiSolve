// ============================================
// routes/adminRoutes.js - COMPLETELY FIXED
// ============================================
import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';

import {
  getAdminDashboard,
  getAllComplaints,
  getComplaintById,
  assignComplaintToStaff,
  getAvailableStaffForComplaint,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllDepartments,
  getAllStaff,
  getStaffById,
  getDepartmentWorkload
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// ============================================
// MIDDLEWARE: MongoDB ID Validator
// ============================================
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: 'INVALID_MONGODB_ID',
      providedId: id,
      hint: 'MongoDB ID must be a 24-character hexadecimal string'
    });
  }
  
  next();
};

// ============================================
// MIDDLEWARE: Prevent ?id= in query params
// ============================================
const preventQueryId = (req, res, next) => {
  if (req.query.id) {
    return res.status(400).json({
      success: false,
      message: "Invalid route format. Don't use ?id= in the URL",
      hint: "Use /resource/:id instead of /resource?id=xxx",
      correctExample: req.path === '/complaints' 
        ? `/api/admin/complaints/${req.query.id}`
        : req.path === '/users'
        ? `/api/admin/users/${req.query.id}`
        : `/api/admin/staff/${req.query.id}`
    });
  }
  next();
};

// Apply authentication to all routes
adminRouter.use(verifyToken);
adminRouter.use(adminAuth);

// ============================================
// DASHBOARD ROUTES
// ============================================
adminRouter.get('/dashboard', getAdminDashboard);
adminRouter.get('/department-workload', getDepartmentWorkload);

// ============================================
// DEPARTMENTS ROUTES
// ============================================
adminRouter.get('/departments', getAllDepartments);

// ============================================
// COMPLAINTS ROUTES
// CRITICAL: Specific sub-routes MUST come BEFORE generic :id route!
// ============================================
adminRouter.get('/complaints', preventQueryId, getAllComplaints);
adminRouter.get('/complaints/:id/available-staff', validateObjectId, getAvailableStaffForComplaint);
adminRouter.get('/complaints/:id', validateObjectId, getComplaintById);
adminRouter.post('/complaints/:id/assign', validateObjectId, assignComplaintToStaff);

// ============================================
// USERS ROUTES
// ============================================
adminRouter.get('/users', preventQueryId, getAllUsers);
adminRouter.get('/users/:id', validateObjectId, getUserById);
adminRouter.delete('/users/:id', validateObjectId, deleteUser);

// ============================================
// STAFF ROUTES
// ============================================
adminRouter.get('/staff', preventQueryId, getAllStaff);
adminRouter.get('/staff/:id', validateObjectId, getStaffById);

// ============================================
// 404 HANDLER - Must be last!
// ============================================
adminRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Admin route not found",
    requestedPath: req.path,
    method: req.method,
    hint: "Check the API documentation for valid routes"
  });
});

export default adminRouter;