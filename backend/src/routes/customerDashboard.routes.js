const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  customerDashboard,
} = require("../controllers/customerDashboard.controller");

// ================= CUSTOMER DASHBOARD =================

router.get(
  "/",
  protect,
  authorize("customer"),
  customerDashboard
);

module.exports = router;