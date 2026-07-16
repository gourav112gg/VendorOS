const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
  toggleAvailability,
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

router.put(
  "/:id",
  protect,
  authorize("owner", "manager"),
  updateWorker
);

const rateLimiter = require("../middleware/rateLimiter");
const deleteLimiter = rateLimiter({ windowMs: 60000, max: 3, message: "Too many delete operations. Please try again later." });

router.delete(
  "/:id",
  protect,
  authorize("owner", "manager"),
  deleteLimiter,
  deleteWorker
);

router.patch(
  "/:id/availability",
  protect,
  authorize("owner", "manager"),
  toggleAvailability
);

module.exports = router;