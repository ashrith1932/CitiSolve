const express = require("express");
const isAuthenticated = require("../middleware/authmiddleware.js");
const citizencontrollers = require("../controllers/citizencontrollers.js");
const multer = require("multer");
const upload = multer();

const router = express.Router()


router.get("/citizen/complaints/data" ,isAuthenticated, citizencontrollers.getcomplaintstatsforuser);
router.get("/complaints",isAuthenticated,citizencontrollers.getcomplaintsforuser);
router.post("/submit", upload.single("image"),isAuthenticated,citizencontrollers.submitcomplaint);
router.post("/complaints/delete", isAuthenticated, citizencontrollers.deletecomplaint);

module.exports=router;