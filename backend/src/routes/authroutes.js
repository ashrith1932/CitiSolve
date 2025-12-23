const express = require("express");
const isAuthenticated = require("../middleware/authmiddleware.js");
const authcontrollers = require("../controllers/authcontrollers.js");

// const

const router = express.Router();

router.post('/signup', authcontrollers.handlesubmit);
router.post('/login', authcontrollers.handlelogin);
router.get('/logout',authcontrollers.handleLogout);
router.get('/me', isAuthenticated, authcontrollers.getMe);
router.post('/generateotp',authcontrollers.getotp);
router.post('/setsession',authcontrollers.setsessiondata);
router.post('/createuser',authcontrollers.createuser);

module.exports=router;

// ==================== Handlers ====================