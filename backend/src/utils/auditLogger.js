const SuperAdminAuditLog = require("../models/SuperAdminAuditLog");

/**
 * Helper function to log immutable audit log entries for all Super Admin actions
 */
const logAdminAction = async ({
  action,
  targetType = "System",
  targetId = "",
  targetName = "",
  details = {},
  req = null,
}) => {
  try {
    const ipAddress = req
      ? req.headers["x-forwarded-for"] || req.ip || req.connection?.remoteAddress || "127.0.0.1"
      : "127.0.0.1";

    await SuperAdminAuditLog.create({
      action,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress: String(ipAddress),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ Failed to write Super Admin Audit Log:", error.message);
  }
};

module.exports = logAdminAction;
