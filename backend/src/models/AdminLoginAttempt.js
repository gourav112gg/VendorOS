const mongoose = require("mongoose");

const adminLoginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  ipAddress: {
    type: String,
    default: "unknown",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // 60 minutes (1 hour) lockout TTL index
  },
});

module.exports = mongoose.model("AdminLoginAttempt", adminLoginAttemptSchema);
