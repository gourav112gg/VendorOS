const User = require("../models/User");
const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");
const admin = require("../config/firebaseAdmin");
const LoginAttempt = require("../models/LoginAttempt");
const RateLimit = require("../models/RateLimit");

// Helper to record failed login attempts, handle progressive delay increment, and trigger lockout
const recordFailureAttempt = async (email, emailFailKey) => {
  await RateLimit.findOneAndUpdate(
    { key: emailFailKey },
    { $inc: { attempts: 1 }, $set: { lastAttempt: new Date() } },
    { upsert: true }
  );

  await LoginAttempt.create({ email });
  const failuresCount = await LoginAttempt.countDocuments({ email });

  if (failuresCount >= 5) {
    try {
      const firebaseUser = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(firebaseUser.uid, { disabled: true });
      
      // Generate password reset link and simulate email dispatch
      const resetLink = await admin.auth().generatePasswordResetLink(email);
      console.log(`[LOCKOUT NOTIFICATION] Email sent to: ${email} | Reset Link: ${resetLink}`);
    } catch (fbErr) {
      console.warn("[Lockout Service] Could not disable Firebase auth user:", fbErr.message);
    }
  }
};

// ================= OWNER SIGNUP =================
const ownerSignup = async (req, res) => {
  try {
    const { idToken, name, email, phone, companyName } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (verifyError) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support"
      });
    }

    if (decodedToken.email.toLowerCase() !== normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support"
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail, isCustomer: false },
        { phone, isCustomer: false }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support"
      });
    }

    const existingCompany = await Company.findOne({ companyName });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support"
      });
    }

    const owner = await User.create({
      name,
      email: normalizedEmail,
      phone,
      role: "owner",
      isCustomer: false,
    });

    const company = await Company.create({
      companyName,
      owner: owner._id,
    });

    owner.company = company._id;
    await owner.save();

    const token = generateToken(owner._id, owner.role);

    return res.status(201).json({
      success: true,
      message: "Owner registered successfully",
      token,
      owner,
      company,
    });
  } catch (error) {
    console.error("[Owner Signup Error]", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again or contact support"
    });
  }
};

// ================= UNIFIED LOGIN (WITH LOCKOUT & PROGRESSIVE DELAY) =================
const login = async (req, res) => {
  try {
    const { idToken, email, category } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. IP-based Rate Limiting (max 10 requests per IP per minute)
    const clientIp = req.ip || req.connection.remoteAddress || "unknown_ip";
    const ipKey = `ip:${clientIp}`;
    
    const ipLimit = await RateLimit.findOneAndUpdate(
      { key: ipKey },
      { $inc: { attempts: 1 }, $set: { lastAttempt: new Date() } },
      { new: true, upsert: true }
    );

    if (ipLimit.attempts > 10) {
      const oneMinuteAgo = Date.now() - 60000;
      if (new Date(ipLimit.lastAttempt).getTime() > oneMinuteAgo) {
        return res.status(429).json({
          success: false,
          message: "Incorrect email or password"
        });
      } else {
        await RateLimit.deleteOne({ key: ipKey });
      }
    }

    // 2. Lockout Expiry / Release check
    const emailFailKey = `email_fail:${normalizedEmail}`;
    const failuresCount = await LoginAttempt.countDocuments({ email: normalizedEmail });

    if (failuresCount >= 5) {
      const latestAttempt = await LoginAttempt.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
      if (latestAttempt) {
        const timeDiffMs = Date.now() - new Date(latestAttempt.createdAt).getTime();
        const fifteenMinsMs = 15 * 60 * 1000;

        if (timeDiffMs < fifteenMinsMs) {
          return res.status(401).json({
            success: false,
            message: "Incorrect email or password"
          });
        } else {
          // Re-enable and reset attempts
          try {
            const firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
            await admin.auth().updateUser(firebaseUser.uid, { disabled: false });
          } catch (e) {}
          await LoginAttempt.deleteMany({ email: normalizedEmail });
          await RateLimit.deleteOne({ key: emailFailKey });
        }
      }
    }

    // 3. Progressive Delays on failures
    const failRecord = await RateLimit.findOne({ key: emailFailKey });
    if (failRecord && failRecord.attempts > 0) {
      const progress = Math.min(failRecord.attempts, 4);
      const delayMs = Math.pow(2, progress - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    // 4. Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (verifyError) {
      await recordFailureAttempt(normalizedEmail, emailFailKey);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    if (decodedToken.email.toLowerCase() !== normalizedEmail) {
      await recordFailureAttempt(normalizedEmail, emailFailKey);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    // 5. Category-Role Mapping Verification
    let roleQuery = {};
    if (category === "owner") {
      roleQuery = { role: "owner" };
    } else if (category === "vendor") {
      roleQuery = { role: { $in: ["manager", "worker"] } };
    } else if (category === "customer") {
      roleQuery = { role: "customer" };
    } else {
      await recordFailureAttempt(normalizedEmail, emailFailKey);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    const user = await User.findOne({ email: normalizedEmail, ...roleQuery }).populate("company");
    if (!user) {
      await recordFailureAttempt(normalizedEmail, emailFailKey);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    // Successful login: Reset tracking schemas
    await LoginAttempt.deleteMany({ email: normalizedEmail });
    await RateLimit.deleteOne({ key: emailFailKey });

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user
    });
  } catch (error) {
    console.error("[Login Error]", error);
    return res.status(500).json({
      success: false,
      message: "Incorrect email or password"
    });
  }
};

// ================= REPORT FAILURE ENDPOINT =================
const reportFailure = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const emailFailKey = `email_fail:${normalizedEmail}`;

    await recordFailureAttempt(normalizedEmail, emailFailKey);

    return res.status(200).json({
      success: true,
      message: "Incorrect email or password"
    });
  } catch (error) {
    console.error("[Report Failure Error]", error);
    return res.status(200).json({
      success: true,
      message: "Incorrect email or password"
    });
  }
};

module.exports = {
  ownerSignup,
  login,
  reportFailure,
};