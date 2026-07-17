const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { getAllCompanies, updateMyCompany } = require("../controllers/company.controller");

// Public route to get all companies (needed for signup picker)
router.get("/", getAllCompanies);

// Protected routes
router.patch("/me", protect, authorize("owner"), updateMyCompany);

module.exports = router;
