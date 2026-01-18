// routes/authRoutes.js
import express from 'express';
import { 
    sendSignupOtp, 
    verifySignupOtp,
    logout,
    refreshAccessToken,
    sendResetOtp,
    resetPassword,
    isAuthenticated,
    resendSignupOtp,
    sendLoginOtp,
    verifyLoginOtp,
    resendLoginOtp
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
authRouter.post('/send-login-otp',loginLimiter,validateLogin,sendLoginOtp);
authRouter.post('/verify-login-otp',otpLimiter,verifyLoginOtp);
authRouter.post('/resend-login-otp',otpLimiter,resendLoginOtp);
authRouter.post('/send-reset-otp', passwordResetLimiter, sendResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/refresh-token', refreshAccessToken);
// Protected routes (authentication required)
authRouter.post('/logout',  verifyToken,logout);
authRouter.get('/is-authenticated', verifyToken, isAuthenticated);
authRouter.get('/profile', verifyToken, getUserProfile);

export default authRouter;