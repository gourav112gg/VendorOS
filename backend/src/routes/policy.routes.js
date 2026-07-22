const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createPolicy,
  getPolicies,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policy.controller");

// Owner-only: manage company policies/FAQ used by the chatbot
router.post("/", protect, authorize("owner"), createPolicy);
router.get("/", protect, authorize("owner"), getPolicies);
router.put("/:id", protect, authorize("owner"), updatePolicy);
router.delete("/:id", protect, authorize("owner"), deletePolicy);

module.exports = router;