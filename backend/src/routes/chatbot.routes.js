const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const { submitChatQuery } = require("../controllers/chatbot.controller");

// POST /api/chatbot/query — any logged-in role (owner/manager/worker/customer)
router.post("/query", protect, submitChatQuery);

module.exports = router;
