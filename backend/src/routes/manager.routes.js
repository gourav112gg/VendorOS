const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createManager,
  getManagers,
  updateManager,
  deleteManager,
} = require("../controllers/manager.controller");

// Create Manager
router.post(
  "/create",
  protect,
  authorize("owner"),
  createManager
);

// Get All Managers
router.get(
  "/",
  protect,
  authorize("owner"),
  getManagers
);

// Update Manager
router.put(
  "/:id",
  protect,
  authorize("owner"),
  updateManager
);

const rateLimiter = require("../middleware/rateLimiter");
const deleteLimiter = rateLimiter({ windowMs: 60000, max: 3, message: "Too many delete operations. Please try again later." });

// Delete Manager
router.delete(
  "/:id",
  protect,
  authorize("owner"),
  deleteLimiter,
  deleteManager
);

module.exports = router;