const express = require("express");
const multer = require("multer");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { submitVoiceUpdate } = require("../controllers/voiceUpdate.controller");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.post(
  "/:orderId/voice-update",
  protect,
  authorize("worker", "manager", "owner"),
  upload.single("audio"),
  submitVoiceUpdate
);

module.exports = router;