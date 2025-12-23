const express = require("express");
const isAuthenticated= require("../middleware/authmiddleware.js");
const staffcontrollers = require("../controllers/staffcontrollers.js");

const router = express.Router()


router.get("/staff/complaints" ,isAuthenticated, staffcontrollers.getstaffcomplaints);
router.put("/staff/complaints/:complaintId",isAuthenticated, staffcontrollers.updatecomplaint);
// router.get("/complaints",isAuthenticated,citizencontrollers.getcomplaintsforuser);
// router.post("/submit", upload.single("image"),isAuthenticated,citizencontrollers.submitcomplaint);

module.exports=router;