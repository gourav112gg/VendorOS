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

// Delete Manager
router.delete(
  "/:id",
  protect,
  authorize("owner"),
  deleteManager
);

module.exports = router;