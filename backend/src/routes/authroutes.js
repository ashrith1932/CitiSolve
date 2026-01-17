// routes/authRoutes.js
import express from 'express';
import { 
    sendSignupOtp, 
    verifySignupOtp, 
    login, 
    logout,
    refreshAccessToken,
    sendResetOtp,
    resetPassword,
    isAuthenticated,
    resendSignupOtp
} from '../controllers/authController.js';
import { verifyToken, verifyTokenAndAccount, requireRole } from '../middleware/auth.js';
import { getUserProfile } from '../controllers/authController.js';
import { citizenAuth } from '../middleware/citizen.js';
import { adminAuth } from '../middleware/admin.js';
import { validateLogin, validateSignup } from '../middleware/validators.js';
import { staffAuth } from '../middleware/staff.js';
import { passwordResetLimiter, otpLimiter, loginLimiter } from '../middleware/rateLimiter.js';

const authRouter = express.Router();

// Public routes (no authentication needed)
authRouter.post('/send-signup-otp', otpLimiter, validateSignup, sendSignupOtp);
authRouter.post('/verify-signup-otp', verifySignupOtp);
authRouter.post('/resend-signup-otp', otpLimiter, resendSignupOtp);
authRouter.post('/login', loginLimiter, validateLogin, login);
authRouter.post('/send-reset-otp', passwordResetLimiter, sendResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/refresh-token', refreshAccessToken);

// Protected routes (authentication required)
authRouter.post('/logout',  verifyToken,logout);
authRouter.get('/is-authenticated', verifyToken, isAuthenticated);
authRouter.get('/profile', verifyToken, getUserProfile);

export default authRouter;