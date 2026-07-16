const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  managerDashboard,
} = require("../controllers/managerDashboard.controller");

router.get(
  "/",
  protect,
  authorize("manager"),
  managerDashboard
);

module.exports = router;