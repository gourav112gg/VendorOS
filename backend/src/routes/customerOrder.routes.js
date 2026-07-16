const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createCustomerOrder,
  getCustomerOrders,
  getCustomerOrderById,
} = require("../controllers/customerOrder.controller");
// Customer creates a service request (order)
router.post(
  "/",
  protect,
  authorize("customer"),
  createCustomerOrder
);

// Customer views their order history
router.get(
  "/",
  protect,
  authorize("customer"),
  getCustomerOrders
);

router.get(
  "/:id",
  protect,
  authorize("customer"),
  getCustomerOrderById
);

module.exports = router;