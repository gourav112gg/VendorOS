const express = require("express");
const router = express.Router();
const protectSuperAdmin = require("../middleware/adminAuth.middleware");
const { adminLogin, verifyAdminSession } = require("../controllers/adminAuth.controller");

// Super Admin 3-Factor Login
router.post("/login", adminLogin);

// Verify Admin Session
router.get("/me", protectSuperAdmin, verifyAdminSession);

module.exports = router;
