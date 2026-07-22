const express = require("express");
const router = express.Router();
const protectSuperAdmin = require("../middleware/adminAuth.middleware");
const {
  getPlatformStats,
  getCompaniesList,
  getUsersList,
  getAuditLogs,
} = require("../controllers/adminDashboard.controller");
const {
  updateCompanySubscriptionOverride,
  clearCompanySubscriptionOverride,
  toggleCompanySuspension,
  deleteCompanyPermanent,
} = require("../controllers/adminCompany.controller");

// Protect all routes in this router with Super Admin authentication
router.use(protectSuperAdmin);

// Analytics & Directory Routes
router.get("/stats", getPlatformStats);
router.get("/companies", getCompaniesList);
router.get("/users", getUsersList);
router.get("/audit-logs", getAuditLogs);

// Subscription Override Controls
router.patch("/companies/:id/subscription", updateCompanySubscriptionOverride);
router.patch("/companies/:id/subscription/clear-override", clearCompanySubscriptionOverride);

// Company Actions
router.patch("/companies/:id/suspend", toggleCompanySuspension);
router.delete("/companies/:id", deleteCompanyPermanent);

module.exports = router;
