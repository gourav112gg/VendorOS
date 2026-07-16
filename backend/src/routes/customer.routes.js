const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  getCustomerOrders,
  getCustomerProfile,
} = require("../controllers/customer.controller");

// Protected Routes (customer only)
router.get("/my-orders", protect, authorize("customer"), getCustomerOrders);
router.get("/profile", protect, authorize("customer"), getCustomerProfile);

module.exports = router;
