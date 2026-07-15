const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  assignManager,
  assignWorker,
  getMyOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

// ================= OWNER & MANAGER =================

// Create Order
router.post(
  "/",
  protect,
  authorize("owner", "manager"),
  createOrder
);

// Get All Orders
router.get(
  "/",
  protect,
  authorize("owner", "manager"),
  getOrders
);

// Get Single Order
router.get(
  "/:id",
  protect,
  authorize("owner", "manager"),
  getOrderById
);

// Update Order
router.put(
  "/:id",
  protect,
  authorize("owner", "manager"),
  updateOrder
);

// Delete Order
router.delete(
  "/:id",
  protect,
  authorize("owner"),
  deleteOrder
);

// Assign Manager
router.patch(
  "/assign-manager",
  protect,
  authorize("owner"),
  assignManager
);

// Assign Worker
router.patch(
  "/assign-worker",
  protect,
  authorize("owner", "manager"),
  assignWorker
);

// ================= WORKER =================

// Get My Orders
router.get(
  "/worker/my-orders",
  protect,
  authorize("worker"),
  getMyOrders
);

// Update Order Status
router.patch(
  "/worker/:id/status",
  protect,
  authorize("worker"),
  updateOrderStatus
);

module.exports = router;