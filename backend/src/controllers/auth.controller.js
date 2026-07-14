const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");

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
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
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

module.exports = {
  ownerSignup,
  ownerLogin,
};