const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createManager,
  getManagers,
  updateManager,  deleteManager,
} = require("../controllers/manager.controller");

router.post(
  "/create",
  protect,
  authorize("owner"),
  createManager
);
router.get(
  "/",
  protect,
  authorize("owner"),
  getManagers
);
router.put(
  "/:id",
  protect,
  authorize("owner"),
  updateManager
);

router.delete(
  "/:id",
  protect,
  authorize("owner"),
  deleteManager
);

module.exports = router;