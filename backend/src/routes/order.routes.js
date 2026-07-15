const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createOrder,
  getOrders,
} = require("../controllers/order.controller");

router.post(
  "/",
  protect,
  authorize("owner", "manager"),
  createOrder
);

router.get(
  "/",
  protect,
  authorize("owner", "manager"),
  getOrders
);

module.exports = router;