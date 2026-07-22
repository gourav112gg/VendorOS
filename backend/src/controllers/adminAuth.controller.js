const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/SuperAdmin");
const AdminLoginAttempt = require("../models/AdminLoginAttempt");
const logAdminAction = require("../utils/auditLogger");
const { sendSecurityAlertEmail } = require("../utils/securityAlert");

/**
 * Hardened 3-Factor Login for Super Admin Portal
 * Requires: Email, Password, AND Static Passphrase
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password, passphrase } = req.body;
    const ipAddress = req.headers["x-forwarded-for"] || req.ip || "127.0.0.1";

    if (!email || !password || !passphrase) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Lockout Check: Count failed attempts in the last 60 minutes (3600 seconds)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const failedAttemptsCount = await AdminLoginAttempt.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: oneHourAgo },
    });

    if (failedAttemptsCount >= 3) {
      await logAdminAction({
        action: "ADMIN_LOGIN_BLOCKED_LOCKOUT",
        targetType: "System",
        details: { email: normalizedEmail, failedAttemptsCount, lockoutWindowMinutes: 60 },
        req,
      });

      return res.status(429).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // 2. Fetch SuperAdmin document
    const superAdmin = await SuperAdmin.findOne({ email: normalizedEmail });

    // Helper for handling authentication failure
    const handleAuthFailure = async (reason) => {
      // Record failed attempt
      await AdminLoginAttempt.create({ email: normalizedEmail, ipAddress: String(ipAddress) });

      const newAttemptCount = await AdminLoginAttempt.countDocuments({
        email: normalizedEmail,
        createdAt: { $gte: oneHourAgo },
      });

      const isNowLockedOut = newAttemptCount >= 3;

      // Immediate Security Alert on EVERY failed attempt
      await sendSecurityAlertEmail({
        adminEmail: normalizedEmail,
        ipAddress: String(ipAddress),
        attemptCount: newAttemptCount,
        isLockedOut: isNowLockedOut,
      });

      // Audit Log entry
      await logAdminAction({
        action: isNowLockedOut ? "ADMIN_ACCOUNT_LOCKED_OUT" : "ADMIN_LOGIN_FAILED",
        targetType: "System",
        details: { reason, attemptCount: newAttemptCount, isLockedOut: isNowLockedOut },
        req,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    };

    if (!superAdmin) {
      return await handleAuthFailure("Account not found");
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(password.trim(), superAdmin.passwordHash);
    if (!isPasswordValid) {
      return await handleAuthFailure("Password mismatch");
    }

    // 4. Verify Static Passphrase
    const isPassphraseValid = await bcrypt.compare(passphrase.trim(), superAdmin.passphraseHash);
    if (!isPassphraseValid) {
      return await handleAuthFailure("Passphrase mismatch");
    }

    // 5. Successful Authentication -> Clear failed attempts
    await AdminLoginAttempt.deleteMany({ email: normalizedEmail });

    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    // Log audit action
    await logAdminAction({
      action: "ADMIN_LOGIN_SUCCESS",
      targetType: "User",
      targetId: String(superAdmin._id),
      targetName: superAdmin.email,
      details: { email: superAdmin.email },
      req,
    });

    // Short 2-Hour JWT Session
    const token = jwt.sign(
      { id: superAdmin._id, isSuperAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      success: true,
      message: "Super Admin authenticated successfully",
      token,
      admin: {
        id: superAdmin._id,
        email: superAdmin.email,
        lastLogin: superAdmin.lastLogin,
      },
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Invalid admin credentials",
    });
  }
};

/**
 * Verify current Super Admin token
 */
const verifyAdminSession = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: {
      id: req.superAdmin._id,
      email: req.superAdmin.email,
      lastLogin: req.superAdmin.lastLogin,
    },
  });
};

module.exports = { adminLogin, verifyAdminSession };
