const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    // Ownership — this is what guarantees privacy. Every query in the app
    // must filter by this field, so one user can never read another's chats.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Auto-generated from the first message (like ChatGPT's sidebar titles)
    title: {
      type: String,
      default: "New conversation",
    },

    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        // The message text is NEVER stored in plain text — only the
        // encrypted blob + the pieces needed to decrypt it later.
        encryptedContent: { type: String, required: true },
        iv: { type: String, required: true },
        authTag: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
