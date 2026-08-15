const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    // Ownership — guarantees privacy. Every query filters by this field.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Auto-generated from the first message
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
        // The message text is stored as an AES-256-GCM encrypted blob
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
