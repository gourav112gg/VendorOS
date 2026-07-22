const mongoose = require("mongoose");

const superAdminAuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true,
  },
  targetType: {
    type: String,
    enum: ["System", "Company", "User", "Subscription", "AuditLog"],
    default: "System",
  },
  targetId: {
    type: String,
    default: "",
  },
  targetName: {
    type: String,
    default: "",
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: "unknown",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SuperAdminAuditLog", superAdminAuditLogSchema);
