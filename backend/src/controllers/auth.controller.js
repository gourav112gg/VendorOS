const User = require("../models/User");
const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");
const admin = require("../config/firebaseAdmin");
const LoginAttempt = require("../models/LoginAttempt");
const RateLimit = require("../models/RateLimit");

const demoEmails = [
  "alice@apex.com", "bob@apex.com", "charlie@apex.com", "dave@gmail.com",
  "kaushal@gmail.com", "rahul@gmail.com", "amit@gmail.com"
];

// Helper to record failed login attempts, handle progressive delay increment, and trigger lockout
const recordFailureAttempt = async (email, emailFailKey) => {
  if (demoEmails.includes(email.toLowerCase().trim())) {
    console.log(`[DIAGNOSTIC] Skipping failed attempt logging for demo account: ${email}`);
    return;
  }
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

    const queryConditions = [{ email: normalizedEmail, isCustomer: false }];
    if (phone && phone.trim()) {
      queryConditions.push({ phone: phone.trim(), isCustomer: false });
    }

    const existingUser = await User.findOne({
      $or: queryConditions
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
      phone: phone && phone.trim() ? phone.trim() : undefined,
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
  console.log(`[DIAGNOSTIC] === Login Request Received ===`);
  console.log(`[DIAGNOSTIC] Body: email="${req.body?.email}", category="${req.body?.category}", idToken="${req.body?.idToken ? req.body.idToken.substring(0, 15) + "..." : "undefined"}"`);
  
  try {
    const { idToken, email, category } = req.body;
    
    if (!email) {
      console.log(`[DIAGNOSTIC - REJECT] Missing email field in request body`);
      return res.status(400).json({ success: false, message: "Incorrect email or password" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[DIAGNOSTIC] Normalized email: "${normalizedEmail}"`);



    const isBypassAllowed = process.env.NODE_ENV !== "production" && process.env.ALLOW_AUTH_BYPASS === "true";
    console.log(`[DIAGNOSTIC] Bypass configuration check: isBypassAllowed=${isBypassAllowed} (NODE_ENV="${process.env.NODE_ENV}", ALLOW_AUTH_BYPASS="${process.env.ALLOW_AUTH_BYPASS}")`);

    if (isBypassAllowed && demoEmails.includes(normalizedEmail)) {
      console.log(`[DIAGNOSTIC - BYPASS MATCH] Email "${normalizedEmail}" matches demo/owner list. Category: "${category}"`);
      
      let roleQuery = {};
      if (category === "owner") {
        roleQuery = { role: "owner" };
      } else if (category === "vendor") {
        roleQuery = { role: { $in: ["manager", "worker"] } };
      } else if (category === "customer") {
        roleQuery = { role: "customer" };
      } else {
        console.log(`[DIAGNOSTIC - BYPASS REJECT] Invalid category requested: "${category}" (line 144)`);
        return res.status(401).json({
          success: false,
          message: "Incorrect email or password"
        });
      }

      console.log(`[DIAGNOSTIC] querying User in MongoDB with email: "${normalizedEmail}" and query:`, roleQuery);
      const user = await User.findOne({ email: normalizedEmail, ...roleQuery }).populate("company");
      if (user) {
        console.log(`[DIAGNOSTIC - BYPASS SUCCESS] User found in MongoDB. ID: ${user._id}, Role: ${user.role}, Has Company: ${!!user.company}`);
        const token = generateToken(user._id, user.role);
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          user
        });
      } else {
        console.log(`[DIAGNOSTIC - BYPASS REJECT] User "${normalizedEmail}" not found in MongoDB with role query (line 164)`);
        return res.status(401).json({
          success: false,
          message: "Incorrect email or password"
        });
      }
    }

    // 1. IP-based Rate Limiting (max 10 requests per IP per minute, skipped for demo accounts)
    if (!demoEmails.includes(normalizedEmail)) {
      const clientIp = req.ip || req.connection.remoteAddress || "unknown_ip";
      const ipKey = `ip:${clientIp}`;
      console.log(`[DIAGNOSTIC] Checking IP Rate Limit for clientIp="${clientIp}" (key="${ipKey}")`);
      
      const ipLimit = await RateLimit.findOneAndUpdate(
        { key: ipKey },
        { $inc: { attempts: 1 }, $set: { lastAttempt: new Date() } },
        { new: true, upsert: true }
      );

      console.log(`[DIAGNOSTIC] IP rate-limit attempts: ${ipLimit.attempts}/10`);
      if (ipLimit.attempts > 10) {
        const oneMinuteAgo = Date.now() - 60000;
        if (new Date(ipLimit.lastAttempt).getTime() > oneMinuteAgo) {
          console.log(`[DIAGNOSTIC - REJECT] IP Rate Limit exceeded for IP: "${clientIp}" (line 187)`);
          return res.status(429).json({
            success: false,
            message: "Incorrect email or password"
          });
        } else {
          console.log(`[DIAGNOSTIC] IP rate-limit block expired. Resetting counter for key "${ipKey}"`);
          await RateLimit.deleteOne({ key: ipKey });
        }
      }
    }

    // 2. Lockout Expiry / Release check (skipped for demo accounts)
    const emailFailKey = `email_fail:${normalizedEmail}`;
    if (!demoEmails.includes(normalizedEmail)) {
      const failuresCount = await LoginAttempt.countDocuments({ email: normalizedEmail });
      console.log(`[DIAGNOSTIC] Active failed login attempts for "${normalizedEmail}": ${failuresCount}/5`);

      if (failuresCount >= 5) {
        const latestAttempt = await LoginAttempt.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
        if (latestAttempt) {
          const timeDiffMs = Date.now() - new Date(latestAttempt.createdAt).getTime();
          const fifteenMinsMs = 15 * 60 * 1000;
          console.log(`[DIAGNOSTIC] Lockout check: failed attempts >= 5. Last failure was ${timeDiffMs / 1000}s ago. Lockout duration: 15 mins (${fifteenMinsMs}ms)`);

          if (timeDiffMs < fifteenMinsMs) {
            console.log(`[DIAGNOSTIC - REJECT] Account currently locked out: "${normalizedEmail}" (line 211)`);
            return res.status(401).json({
              success: false,
              message: "Incorrect email or password"
            });
          } else {
            // Re-enable and reset attempts
            console.log(`[DIAGNOSTIC] Lockout expired. Re-enabling Firebase user and deleting lockout records for "${normalizedEmail}"`);
            try {
              const firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
              await admin.auth().updateUser(firebaseUser.uid, { disabled: false });
            } catch (e) {
              console.log(`[DIAGNOSTIC] Firebase user lookup/update failed on lockout release: ${e.message}`);
            }
            await LoginAttempt.deleteMany({ email: normalizedEmail });
            await RateLimit.deleteOne({ key: emailFailKey });
          }
        }
      }
    }

    // 3. Progressive Delays on failures (skipped for demo accounts)
    if (!demoEmails.includes(normalizedEmail)) {
      const failRecord = await RateLimit.findOne({ key: emailFailKey });
      if (failRecord && failRecord.attempts > 0) {
        const progress = Math.min(failRecord.attempts, 4);
        const delayMs = Math.pow(2, progress - 1) * 1000;
        console.log(`[DIAGNOSTIC] Progressive delay: attempt count ${failRecord.attempts}, delaying response by ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // 4. Verify Firebase ID Token
    console.log(`[DIAGNOSTIC] Verifying Firebase ID Token...`);
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(`[DIAGNOSTIC] Firebase ID Token successfully verified. Decoded email: "${decodedToken.email}"`);
    } catch (verifyError) {
      console.error(`[DIAGNOSTIC - REJECT] Firebase ID Token verification failed: "${normalizedEmail}". Error: ${verifyError.message} (line 247)`);
      
      // Attempt to fetch status from Firebase Auth directly
      try {
        const fbUser = await admin.auth().getUserByEmail(normalizedEmail);
        console.error(`[DIAGNOSTIC - CASE A STATUS] Firebase user details: UID="${fbUser.uid}", disabled=${fbUser.disabled}, metadata=${JSON.stringify(fbUser.metadata)}`);
      } catch (fbStatusError) {
        console.error(`[DIAGNOSTIC - CASE A STATUS] Failed to lookup Firebase user: ${fbStatusError.message}`);
      }

      await recordFailureAttempt(normalizedEmail, emailFailKey);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    if (decodedToken.email.toLowerCase() !== normalizedEmail) {
      console.error(`[DIAGNOSTIC - REJECT] Decoded token email "${decodedToken.email.toLowerCase()}" does not match requested email "${normalizedEmail}" (line 264)`);
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
      console.error(`[DIAGNOSTIC - REJECT] Invalid category requested: "${category}" (line 280)`);
      await recordFailureAttempt(normalizedEmail, emailFailKey);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    console.log(`[DIAGNOSTIC] Querying MongoDB User... Email: "${normalizedEmail}", RoleQuery:`, roleQuery);

    // Find the user first without role query to diagnose role mismatch vs user missing
    const userWithoutRoleQuery = await User.findOne({ email: normalizedEmail }).populate("company");
    if (!userWithoutRoleQuery) {
      console.error(`[DIAGNOSTIC - REJECT] Firebase authenticated successfully, but email "${normalizedEmail}" was not found in MongoDB (line 293).`);
      await recordFailureAttempt(normalizedEmail, emailFailKey);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    const user = await User.findOne({ email: normalizedEmail, ...roleQuery }).populate("company");
    if (!user) {
      console.error(`[DIAGNOSTIC - REJECT] MongoDB user found, but role/category mismatch. Email: "${normalizedEmail}". Requested Category: "${category}". MongoDB User Role: "${userWithoutRoleQuery.role}" (line 303).`);
      await recordFailureAttempt(normalizedEmail, emailFailKey);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    if (user.role !== "customer" && !user.company) {
      console.warn(`[DIAGNOSTIC - WARNING] MongoDB user "${normalizedEmail}" found and matches role, but lacks a linked Company reference.`);
    }

    // Successful login: Reset tracking schemas
    console.log(`[DIAGNOSTIC - SUCCESS] Login successful for "${normalizedEmail}". Resetting lockout and rate limits.`);
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
    console.error(`[DIAGNOSTIC - FATAL ERROR] Internal server error in login handler: ${error.stack || error.message} (line 329)`);
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

const vendorSignup = async (req, res) => {
  try {
    const { idToken, name, email, companyId, role, phone } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.toLowerCase().trim();

    if (normalizedRole !== "manager" && normalizedRole !== "worker") {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support"
      });
    }

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

    const queryConditions = [{ email: normalizedEmail, isCustomer: false }];
    if (phone && phone.trim()) {
      queryConditions.push({ phone: phone.trim(), isCustomer: false });
    }

    const existingUser = await User.findOne({
      $or: queryConditions
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support"
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support"
      });
    }

    const vendor = await User.create({
      name,
      email: normalizedEmail,
      phone: phone && phone.trim() ? phone.trim() : undefined,
      role: normalizedRole,
      isCustomer: false,
      company: null
    });

    const JoinRequest = require("../models/JoinRequest");
    await JoinRequest.create({
      user: vendor._id,
      company: companyId,
      role: normalizedRole,
      status: "pending"
    });

    const token = generateToken(vendor._id, vendor.role);

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      token,
      user: vendor
    });
  } catch (error) {
    console.error("[Vendor Signup Error]", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again or contact support"
    });
  }
};

module.exports = {
  ownerSignup,
  vendorSignup,
  login,
  reportFailure,
};