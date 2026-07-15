const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
} = require("../controllers/inventory.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

// Create Product (Owner only)
router.post(
  "/",
  protect,
  authorize("owner"),
  createProduct
);

// Get All Products (Owner & Manager)
router.get(
  "/",
  protect,
  authorize("owner", "manager"),
  getProducts
);

// Get Product By ID (Owner & Manager)
router.get(
  "/:id",
  protect,
  authorize("owner", "manager"),
  getProductById
);

// Update Product (Owner only)
router.put(
  "/:id",
  protect,
  authorize("owner"),
  updateProduct
);

// Delete Product (Owner only)
router.delete(
  "/:id",
  protect,
  authorize("owner"),
  deleteProduct
);

// Update Stock (Owner & Manager)
router.patch(
  "/:id/stock",
  protect,
  authorize("owner", "manager"),
  updateStock
);

module.exports = router;