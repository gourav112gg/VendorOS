const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  customerSignup,
  customerLogin,
  getCustomerOrders,
  getCustomerProfile,
} = require("../controllers/customer.controller");

// Public Routes
router.post("/signup", customerSignup);
router.post("/login", customerLogin);

// Protected Routes (customer only)
router.get("/my-orders", protect, authorize("customer"), getCustomerOrders);
router.get("/profile", protect, authorize("customer"), getCustomerProfile);

module.exports = router;
