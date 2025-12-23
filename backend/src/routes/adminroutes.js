const express = require("express");
const isAuthenticated= require("../middleware/authmiddleware");
const admincontrollers = require("../controllers/admincontrollers");
const multer = require("multer");
const upload = multer();
const dotenv = require("dotenv");
// import

const router = express.Router();

router.get("/admin/complaintsallocation",isAuthenticated,admincontrollers.admincomplaintsallocation);
router.post("/admin/complaints/allocate",isAuthenticated,admincontrollers.admincomplaintsallocate);
router.get("/admin/complaints",isAuthenticated,admincontrollers.admincomplaints);
router.get("/admin/complaints/edit",isAuthenticated,admincontrollers.admincomplaintsedit);
router.post("/admin/users/delete",isAuthenticated,admincontrollers.adminusersdelete);
router.get("/admin/departments",isAuthenticated,admincontrollers.admingetdepartments);
router.get("/admin/staff",isAuthenticated,admincontrollers.getstaffdetails);

module.exports=router;