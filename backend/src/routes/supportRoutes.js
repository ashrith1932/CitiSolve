import express from 'express';
import { submitSupportMessage } from '../controllers/supportController.js';
import { verifyToken } from '../middleware/auth.js';
import { citizenAuth } from '../middleware/citizen.js';

const supportRouter = express.Router();

// ============================================
// CITIZEN SUPPORT ROUTE - JUST ONE!
// ============================================

// Submit support message → Admin gets notified → Admin emails back
supportRouter.post(
  '/submit', 
  verifyToken,
  citizenAuth,
  submitSupportMessage
);

export default supportRouter;