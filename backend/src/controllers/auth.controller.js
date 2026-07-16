const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");
const admin = require("../config/firebaseAdmin");
const LoginAttempt = require("../models/LoginAttempt");

// ================= OWNER SIGNUP =================
const ownerSignup = async (req, res) => {
  try {
    const { name, email, phone, password, companyName } = req.body;

    if (!name || !email || !phone || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email, isCustomer: false },
        { phone, isCustomer: false }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or phone",
      });
    }

    const existingCompany = await Company.findOne({ companyName });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
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

    const ownerResponse = owner.toObject();
    delete ownerResponse.password;

    return res.status(201).json({
      success: true,
      message: "Owner registered successfully",
      token,
      owner: ownerResponse,
      company,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= OWNER LOGIN =================
const ownerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const owner = await User.findOne({
      email,
      role: "owner",
    }).populate("company");

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    const isMatch = await bcrypt.compare(password, owner.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(owner._id, owner.role);

    const ownerResponse = owner.toObject();
    delete ownerResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      owner: ownerResponse,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const managerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const manager = await User.findOne({
      email,
      role: "manager",
    }).populate("company");

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    const isMatch = await bcrypt.compare(password, manager.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(manager._id, manager.role);

    const managerResponse = manager.toObject();
    delete managerResponse.password;

    return res.status(200).json({
      success: true,
      message: "Manager login successful",
      token,
      manager: managerResponse,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const workerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const worker = await User.findOne({
      email,
      role: "worker",
    }).populate("company");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    const isMatch = await bcrypt.compare(password, worker.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(worker._id, worker.role);

    const workerResponse = worker.toObject();
    delete workerResponse.password;

    return res.status(200).json({
      success: true,
      message: "Worker login successful",
      token,
      worker: workerResponse,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= UNIFIED LOGIN (WITH SECURITY MODEL & LOCKOUT) =================
const login = async (req, res) => {
  try {
    const { email, password, category } = req.body;

    if (!email || !password || !category) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and category are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check failed login attempts lockout (5 attempts in 15 minutes rolling window)
    const failuresCount = await LoginAttempt.countDocuments({ email: normalizedEmail });

    let isLockedOut = false;
    let firebaseUser = null;

    try {
      firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
      if (firebaseUser.disabled) {
        isLockedOut = true;
      }
    } catch (fbErr) {
      // Ignore: User may not exist in Firebase yet
    }

    if (failuresCount >= 5 || isLockedOut) {
      const latestAttempt = await LoginAttempt.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
      if (latestAttempt) {
        const timeDiffMs = Date.now() - new Date(latestAttempt.createdAt).getTime();
        const fifteenMinsMs = 15 * 60 * 1000;

        if (timeDiffMs < fifteenMinsMs) {
          // Still locked out
          if (firebaseUser && !firebaseUser.disabled) {
            await admin.auth().updateUser(firebaseUser.uid, { disabled: true });
          }
          return res.status(423).json({
            success: false,
            message: "Too many failed attempts. Try again in 15 minutes.",
          });
        } else {
          // Lockout expired: re-enable and reset count
          if (firebaseUser && firebaseUser.disabled) {
            await admin.auth().updateUser(firebaseUser.uid, { disabled: false });
          }
          await LoginAttempt.deleteMany({ email: normalizedEmail });
        }
      }
    }

    // 2. Map category parameter to role queries
    let roleQuery = {};
    if (category === "owner") {
      roleQuery = { role: "owner" };
    } else if (category === "vendor") {
      roleQuery = { role: { $in: ["manager", "worker"] } };
    } else if (category === "customer") {
      roleQuery = { role: "customer" };
    } else {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // 3. Find user in MongoDB by email and mapped role
    const user = await User.findOne({ email: normalizedEmail, ...roleQuery }).populate("company");

    let isMatch = false;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Dummy compare to avoid timing analysis attacks
      await bcrypt.compare(password, "$2b$10$abcdefghijklmnopqrstuvwx");
    }

    if (!user || !isMatch) {
      // Record failure attempt
      await LoginAttempt.create({ email: normalizedEmail });
      
      const newFailuresCount = await LoginAttempt.countDocuments({ email: normalizedEmail });
      if (newFailuresCount >= 5) {
        if (firebaseUser) {
          await admin.auth().updateUser(firebaseUser.uid, { disabled: true });
        }
        return res.status(423).json({
          success: false,
          message: "Too many failed attempts. Try again in 15 minutes.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Success: Reset failed attempts counter
    await LoginAttempt.deleteMany({ email: normalizedEmail });

    // Generate custom session JWT token
    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= REPORT FAILURE ENDPOINT =================
const reportFailure = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await LoginAttempt.create({ email: normalizedEmail });

    const failuresCount = await LoginAttempt.countDocuments({ email: normalizedEmail });
    if (failuresCount >= 5) {
      try {
        const firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
        await admin.auth().updateUser(firebaseUser.uid, { disabled: true });
      } catch (fbErr) {
        // Safe to ignore if user does not exist in Firebase
      }
      return res.status(423).json({
        success: false,
        message: "Too many failed attempts. Try again in 15 minutes.",
      });
    }

    return res.status(200).json({ success: true, count: failuresCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  ownerSignup,
  ownerLogin,
  managerLogin,
  workerLogin,
  login,
  reportFailure,
};