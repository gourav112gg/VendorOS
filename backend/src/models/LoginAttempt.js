const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // MongoDB TTL index: automatically deletes document after 15 minutes
    },
  }
);

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
