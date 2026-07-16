const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  salesReport,
  orderReport,
  inventoryReport,
} = require("../controllers/report.controller");

router.get(
  "/sales",
  protect,
  authorize("owner"),
  salesReport
);

router.get(
  "/orders",
  protect,
  authorize("owner"),
  orderReport
);

router.get(
  "/inventory",
  protect,
  authorize("owner"),
  inventoryReport
);

module.exports = router;