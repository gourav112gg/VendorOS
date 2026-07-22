const Company = require("../models/Company");
const User = require("../models/User");
const SuperAdminAuditLog = require("../models/SuperAdminAuditLog");
const logAdminAction = require("../utils/auditLogger");

/**
 * Get Platform-Wide Analytics & System Stats
 */
const getPlatformStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: "active" });
    const suspendedCompanies = await Company.countDocuments({ status: "suspended" });

    const freeCount = await Company.countDocuments({ "subscription.tier": "free" });
    const growthCount = await Company.countDocuments({ "subscription.tier": "growth" });
    const scaleCount = await Company.countDocuments({ "subscription.tier": "scale" });

    const manualOverrideCount = await Company.countDocuments({ "subscription.manualOverride.active": true });

    const totalUsers = await User.countDocuments();
    const ownersCount = await User.countDocuments({ role: "owner" });
    const managersCount = await User.countDocuments({ role: "manager" });
    const workersCount = await User.countDocuments({ role: "worker" });
    const customersCount = await User.countDocuments({ isCustomer: true });

    await logAdminAction({
      action: "ADMIN_VIEW_STATS",
      targetType: "System",
      req,
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        tierBreakdown: {
          free: freeCount,
          growth: growthCount,
          scale: scaleCount,
        },
        manualOverrideCount,
        users: {
          total: totalUsers,
          owners: ownersCount,
          managers: managersCount,
          workers: workersCount,
          customers: customersCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load platform stats",
    });
  }
};

/**
 * Get All Multi-Tenant Companies List
 */
const getCompaniesList = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate("owner", "name email phone role")
      .sort({ createdAt: -1 });

    await logAdminAction({
      action: "ADMIN_VIEW_COMPANIES",
      targetType: "Company",
      details: { count: companies.length },
      req,
    });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Error fetching companies list:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load companies list",
    });
  }
};

/**
 * Get Global Directory of All Users Across Companies
 */
const getUsersList = async (req, res) => {
  try {
    const users = await User.find()
      .populate("company", "companyName status subscription")
      .sort({ createdAt: -1 });

    await logAdminAction({
      action: "ADMIN_VIEW_USERS",
      targetType: "User",
      details: { count: users.length },
      req,
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users list:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load global user directory",
    });
  }
};

/**
 * Get Immutable Audit Trail Log Records (Read Only)
 */
const getAuditLogs = async (req, res) => {
  try {
    const logs = await SuperAdminAuditLog.find()
      .sort({ timestamp: -1 })
      .limit(300);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load audit logs",
    });
  }
};

module.exports = {
  getPlatformStats,
  getCompaniesList,
  getUsersList,
  getAuditLogs,
};
