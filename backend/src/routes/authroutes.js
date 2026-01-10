// routes/authroutes.js
const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  verifyOTP, 
  resendOTP, 
  getMe, 
  logout 
} = require('../controllers/authcontrollers');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', getMe);
router.post('/logout', logout);
module.exports = router;