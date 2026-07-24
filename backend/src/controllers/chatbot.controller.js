const { handleChatQuery } = require("../services/chatbot.service");
const { transcribeAudio } = require("../services/groqTranscribe.service");
const { clearHistory } = require("../utils/chatMemory");
const ChatSession = require("../models/ChatSession");
const { decrypt } = require("../utils/encryption");

/**
 * POST /api/chatbot/query
 */
async function submitChatQuery(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Please type a message." });
    }

    const reply = await handleChatQuery(message.trim(), req.user);

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Chatbot query failed:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong answering that — please try again.",
    });
  }
}

/**
 * POST /api/chatbot/voice-query
 */
async function submitVoiceChatQuery(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file received." });
    }

    const transcript = await transcribeAudio(req.file.buffer, req.file.originalname || "query.webm");

    if (!transcript) {
      return res.status(200).json({
        transcript: "",
        reply: "Couldn't hear anything clear — please try again or type your question.",
      });
    }

    const reply = await handleChatQuery(transcript, req.user);

    return res.status(200).json({ success: true, transcript, reply });
  } catch (error) {
    console.error("Voice chatbot query failed:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong answering that — please try again.",
    });
  }
}

/**
 * DELETE /api/chatbot/history
 * Starts a brand-new conversation immediately (like clicking "New Chat").
 * Past conversations are NOT deleted — they remain visible via /sessions.
 */
async function clearChatHistory(req, res) {
  await clearHistory(req.user._id);
  return res.status(200).json({ success: true, message: "Started a new conversation." });
}

/**
 * GET /api/chatbot/sessions
 * Lists this user's past conversations (sidebar-style) — title, last updated,
 * message count. Strictly scoped to req.user._id, so nobody can list or read
 * another user's conversations.
 */
async function listChatSessions(req, res) {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s._id,
        title: s.title,
        messageCount: s.messages.length,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Listing chat sessions failed:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * GET /api/chatbot/sessions/:sessionId
 * Opens one past conversation, decrypted just for this response. Ownership
 * is checked via the { _id, user: req.user._id } query — a session that
 * belongs to someone else simply won't be found (404), never leaked.
 */
async function getChatSession(req, res) {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const messages = session.messages.map((m) => ({
      role: m.role,
      content: decrypt({
        encryptedContent: m.encryptedContent,
        iv: m.iv,
        authTag: m.authTag,
      }),
      timestamp: m.timestamp,
    }));

    return res.status(200).json({ success: true, title: session.title, messages });
  } catch (error) {
    console.error("Opening chat session failed:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

module.exports = {
  submitChatQuery,
  submitVoiceChatQuery,
  clearChatHistory,
  listChatSessions,
  getChatSession,
};
