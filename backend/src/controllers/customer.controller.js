const User = require("../models/User");
const Company = require("../models/Company");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// ================= REGISTER CUSTOMER =================

const registerCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      companyId,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !companyId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
      company: company._id,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      token: generateToken(customer._id),
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  registerCustomer,
};