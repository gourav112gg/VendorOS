const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  ownerDashboard,
} = require("../controllers/dashboard.controller");

router.get(
  "/owner",
  protect,
  authorize("owner"),
  ownerDashboard
);

module.exports = router;