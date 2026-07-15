const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const { getDashboard } = require("../controllers/dashboard.controller");

router.get(
  "/",
  protect,
  authorize("owner", "manager"),
  getDashboard
);

module.exports = router;