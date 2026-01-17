// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
// Login rate limiter - 5 attempts per 15 minutes
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// OTP rate limiter - 3 attempts per hour
export const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again after 1 hour.'
    }
});

// Password reset limiter - 3 attempts per hour
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many password reset attempts. Please try again later.'
    }
});