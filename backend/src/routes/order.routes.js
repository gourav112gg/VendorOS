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
  assignWorker,
  assignManager,
  getMyOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");
// ===============================
// Create Order
// ===============================
router.post(
  "/",
  protect,
  authorize("owner", "manager"),
  createOrder
);

// ===============================
// Get All Orders
// ===============================
router.get(
  "/",
  protect,
  authorize("owner", "manager"),
  getOrders
);

// ===============================
// Worker Dashboard - My Orders
// IMPORTANT: Keep this ABOVE "/:id"
// ===============================
router.get(
  "/my-orders",
  protect,
  authorize("worker"),
  getMyOrders
);

// ===============================
// Get Order By ID
// ===============================
router.get(
  "/:id",
  protect,
  authorize("owner", "manager"),
  getOrderById
);

// ===============================
// Update Order
// ===============================
router.put(
  "/:id",
  protect,
  authorize("owner", "manager"),
  updateOrder
);

// ===============================
// Delete Order
// ===============================
router.delete(
  "/:id",
  protect,
  authorize("owner"),
  deleteOrder
);

// ===============================
// Assign Worker
// ===============================
router.patch(
  "/assign-worker",
  protect,
  authorize("owner", "manager"),
  assignWorker
);

router.patch(
  "/:id/status",
  protect,
  authorize("worker"),
  updateOrderStatus
);

router.patch(
  "/assign-manager",
  protect,
  authorize("owner"),
  assignManager
);

module.exports = router;