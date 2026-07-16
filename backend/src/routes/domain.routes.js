const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createDomain,
  getDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
} = require("../controllers/domain.controller");

// Get all domains (owner + manager can view)
router.get("/", protect, authorize("owner", "manager"), getDomains);

// Get single domain
router.get("/:id", protect, authorize("owner", "manager"), getDomainById);

// Create domain (owner only)
router.post("/", protect, authorize("owner"), createDomain);

// Update domain (owner only)
router.put("/:id", protect, authorize("owner"), updateDomain);

// Delete domain (owner only)
router.delete("/:id", protect, authorize("owner"), deleteDomain);

module.exports = router;
