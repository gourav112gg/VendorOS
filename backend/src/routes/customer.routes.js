const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  registerCustomer,
} = require("../controllers/customer.controller");

// ================= CUSTOMER AUTH =================

// Register Customer
router.post("/register", registerCustomer);

module.exports = router;