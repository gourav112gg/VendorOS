const { handleChatQuery } = require("../services/chatbot.service");

/**
 * POST /api/chatbot/query
 * body: { message: "where is my order" }
 * Works for ANY logged-in role — protect middleware just needs a valid token,
 * no authorize() role restriction, since this is a general assistant for everyone.
 */
async function submitChatQuery(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please type a message.",
      });
    }

    const reply = await handleChatQuery(message.trim(), req.user);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chatbot query failed:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong answering that — please try again.",
    });
  }
}

module.exports = { submitChatQuery };
