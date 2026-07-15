const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
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

router.put(
  "/:id",
  protect,
  authorize("owner", "manager"),
  updateOrder
);

router.get(
  "/:id",
  protect,
  authorize("owner", "manager"),
  getOrderById
);

router.delete(
  "/:id",
  protect,
  authorize("owner"),
  deleteOrder
);

module.exports = router;