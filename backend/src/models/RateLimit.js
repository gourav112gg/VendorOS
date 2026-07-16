const mongoose = require("mongoose");

const rateLimitSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastAttempt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // 1 hour TTL
    },
  }
);

module.exports = mongoose.model("RateLimit", rateLimitSchema);
