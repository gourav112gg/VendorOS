const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  workerDashboard,
} = require("../controllers/workerDashboard.controller");

router.get(
  "/",
  protect,
  authorize("worker"),
  workerDashboard
);

module.exports = router;