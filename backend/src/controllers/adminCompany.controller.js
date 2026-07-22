const Company = require("../models/Company");
const User = require("../models/User");
const logAdminAction = require("../utils/auditLogger");

/**
 * Phase 4: Set Manual Subscription Tier Override for a Company
 * A manual admin change wins over Razorpay webhook updates.
 */
const updateCompanySubscriptionOverride = async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;

    const allowedTiers = ["free", "growth", "scale"];
    if (!allowedTiers.includes(tier)) {
      return res.status(400).json({
        success: false,
        message: `Invalid tier. Must be one of: ${allowedTiers.join(", ")}`,
      });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const oldTier = company.subscription.tier;

    // Apply manual override
    company.subscription.tier = tier;
    company.subscription.status = "active";
    company.subscription.manualOverride = {
      active: true,
      tier: tier,
      setBy: req.superAdmin?.email || "Super Admin",
      setAt: new Date(),
    };

    await company.save();

    await logAdminAction({
      action: "CHANGE_SUBSCRIPTION_OVERRIDE",
      targetType: "Company",
      targetId: String(company._id),
      targetName: company.companyName,
      details: {
        oldTier,
        newTier: tier,
        manualOverrideActive: true,
        setBy: req.superAdmin?.email || "Super Admin",
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Manual subscription override updated to '${tier}' for company '${company.companyName}'`,
      company,
    });
  } catch (error) {
    console.error("Error setting subscription override:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set subscription override",
    });
  }
};

/**
 * Phase 4: Clear Manual Subscription Override
 * Returns company to being driven by Razorpay webhooks
 */
const clearCompanySubscriptionOverride = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const oldOverride = company.subscription.manualOverride;

    company.subscription.manualOverride = {
      active: false,
      tier: company.subscription.tier,
      setBy: "",
      setAt: null,
    };

    await company.save();

    await logAdminAction({
      action: "CLEAR_SUBSCRIPTION_OVERRIDE",
      targetType: "Company",
      targetId: String(company._id),
      targetName: company.companyName,
      details: {
        clearedOverride: oldOverride,
        activeTier: company.subscription.tier,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Manual subscription override cleared for company '${company.companyName}'`,
      company,
    });
  } catch (error) {
    console.error("Error clearing subscription override:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear subscription override",
    });
  }
};

/**
 * Phase 5: Suspend or Unsuspend a Company
 * Blocks all login/API access for company users without deleting any data.
 */
const toggleCompanySuspension = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const oldStatus = company.status;
    const newStatus = oldStatus === "active" ? "suspended" : "active";
    company.status = newStatus;

    await company.save();

    const actionName = newStatus === "suspended" ? "SUSPEND_COMPANY" : "UNSUSPEND_COMPANY";

    await logAdminAction({
      action: actionName,
      targetType: "Company",
      targetId: String(company._id),
      targetName: company.companyName,
      details: {
        oldStatus,
        newStatus,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Company '${company.companyName}' has been ${newStatus === "suspended" ? "SUSPENDED" : "REACTIVATED"}`,
      company,
    });
  } catch (error) {
    console.error("Error toggling company suspension:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update company suspension status",
    });
  }
};

/**
 * Phase 5: Permanently Delete a Company
 * Requires exact company name confirmation to execute.
 */
const deleteCompanyPermanent = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmName } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (!confirmName || confirmName.trim().toLowerCase() !== company.companyName.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Confirmation failed: Typed name '${confirmName}' does not match company name '${company.companyName}'`,
      });
    }

    const companyName = company.companyName;

    // Delete associated company users
    const deletedUsersResult = await User.deleteMany({ company: company._id });

    // Delete company
    await company.deleteOne();

    await logAdminAction({
      action: "DELETE_COMPANY_PERMANENT",
      targetType: "Company",
      targetId: String(id),
      targetName: companyName,
      details: {
        companyName,
        usersDeletedCount: deletedUsersResult.deletedCount,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Company '${companyName}' and ${deletedUsersResult.deletedCount} associated user(s) permanently deleted.`,
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete company",
    });
  }
};

module.exports = {
  updateCompanySubscriptionOverride,
  clearCompanySubscriptionOverride,
  toggleCompanySuspension,
  deleteCompanyPermanent,
};
