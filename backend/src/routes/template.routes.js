const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createTemplate,
  getTemplates,
  deleteTemplate,
} = require("../controllers/template.controller");

// Managers only per TRD §7 (explicitly denies Owner and other roles)
router.get("/", protect, authorize("manager"), getTemplates);
router.post("/", protect, authorize("manager"), createTemplate);
router.delete("/:id", protect, authorize("manager"), deleteTemplate);

module.exports = router;
