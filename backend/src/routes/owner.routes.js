const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  ownerDashboard,
} = require("../controllers/owner.controller");

router.get(
  "/dashboard",
  protect,
  authorize("owner"),
  ownerDashboard
);

module.exports = router;