const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createWorker,
  getWorkers,
} = require("../controllers/worker.controller");

router.post(
  "/create",
  protect,
  authorize("owner", "manager"),
  createWorker
);

router.get(
  "/",
  protect,
  authorize("owner", "manager"),
  getWorkers
);

module.exports = router;