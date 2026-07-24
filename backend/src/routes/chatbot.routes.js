const express = require("express");
const multer = require("multer");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const {
  submitChatQuery,
  submitVoiceChatQuery,
  clearChatHistory,
  listChatSessions,
  getChatSession,
} = require("../controllers/chatbot.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// POST /api/chatbot/query — type a question (any logged-in role)
router.post("/query", protect, submitChatQuery);

// POST /api/chatbot/voice-query — speak a question instead
router.post("/voice-query", protect, upload.single("audio"), submitVoiceChatQuery);

// DELETE /api/chatbot/history — start a new conversation (old one stays saved)
router.delete("/history", protect, clearChatHistory);

// GET /api/chatbot/sessions — list this user's past conversations
router.get("/sessions", protect, listChatSessions);

// GET /api/chatbot/sessions/:sessionId — open one past conversation
router.get("/sessions/:sessionId", protect, getChatSession);

module.exports = router;
