// ==========================================
// routes/adminRouterRoutes.js
// ==========================================
import express from 'express';
import mongoose from 'mongoose';
import {
  getAdminDashboard,
  getDepartmentWorkload,
  getAllComplaints,
  getComplaintById,
  getAvailableStaffForComplaint,
  assignComplaintToStaff,
  getAllStaff,
  getStaffById,
  getAllDepartments,
  getAllUsers,
  getUserById,
  deleteUser
} from '../controllers/adminController.js';
import { adminAuth} from '../middleware/admin.js'; 
import { verifyToken } from '../middleware/auth.js';
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
      hint: "Use /complaints/:id instead of /complaints?id=xxx",
      correctExample: `/api/staff/complaints/${req.query.id}`
    });
  }
  next();
};

const adminRouter = express.Router();
adminRouter.use(adminAuth, verifyToken);
// Dashboard
adminRouter.get('/dashboard', getAdminDashboard);
adminRouter.get('/department-workload', getDepartmentWorkload);

// Complaints
adminRouter.get('/complaints',preventQueryId, getAllComplaints);
adminRouter.get('/complaints/:id', validateObjectId, getComplaintById);
adminRouter.get('/complaints/:id/available-staff', validateObjectId, getAvailableStaffForComplaint);
adminRouter.post('/complaints/:id/assign', validateObjectId, assignComplaintToStaff);

// Staff Management
adminRouter.get('/staff', preventQueryId, getAllStaff);
adminRouter.get('/staff/:id', validateObjectId, getStaffById);

// Departments
adminRouter.get('/departments',getAllDepartments);

// User Management (Citizens)
adminRouter.get('/users', preventQueryId,getAllUsers);
// ✅ Add this BEFORE the route
adminRouter.get('/users/:id', validateObjectId, getUserById);

adminRouter.delete('/users/:id',validateObjectId, deleteUser);

export default adminRouter;
