const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  ownerAnalytics,
} = require("../controllers/analytics.controller");

router.get(
  "/",
  protect,
  authorize("owner"),
  ownerAnalytics
);

module.exports = router;