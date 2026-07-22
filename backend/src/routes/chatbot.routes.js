const express = require("express");
const multer = require("multer");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const {
  submitChatQuery,
  submitVoiceChatQuery,
  clearChatHistory,
} = require("../controllers/chatbot.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// POST /api/chatbot/query — type a question (any logged-in role)
router.post("/query", protect, submitChatQuery);

// POST /api/chatbot/voice-query — speak a question instead (any logged-in role)
router.post("/voice-query", protect, upload.single("audio"), submitVoiceChatQuery);

// DELETE /api/chatbot/history — clear remembered conversation for this user
router.delete("/history", protect, clearChatHistory);

module.exports = router;
