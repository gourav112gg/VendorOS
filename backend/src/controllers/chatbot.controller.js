const { handleChatQuery } = require("../services/chatbot.service");
const { transcribeAudio } = require("../services/groqTranscribe.service");
const { clearHistory } = require("../utils/chatMemory");

/**
 * POST /api/chatbot/query
 * body: { message: "where is my order" }
 * Works for ANY logged-in role.
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
 * multipart/form-data body: { audio: <file> }
 * Transcribes the spoken question (reusing the same Whisper service as the
 * voice-update feature), then runs it through the exact same chatbot pipeline.
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
 * Clears this user's remembered conversation (e.g. "start a new chat" button).
 */
async function clearChatHistory(req, res) {
  clearHistory(req.user._id);
  return res.status(200).json({ success: true, message: "Conversation history cleared." });
}

module.exports = { submitChatQuery, submitVoiceChatQuery, clearChatHistory };
