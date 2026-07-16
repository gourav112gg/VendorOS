const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ================= CUSTOMER SIGNUP =================
const customerSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email, isCustomer: true },
        { phone, isCustomer: true }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Customer profile already exists with this email or phone",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
      isCustomer: true,
    });

    const token = generateToken(customer._id, customer.role);

    const customerResponse = customer.toObject();
    delete customerResponse.password;

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      token,
      customer: customerResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= CUSTOMER LOGIN =================
const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const customer = await User.findOne({ email, role: "customer" });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(customer._id, customer.role);

    const customerResponse = customer.toObject();
    delete customerResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      customer: customerResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET MY ORDERS (CUSTOMER) =================
const getCustomerOrders = async (req, res) => {
  try {
    const Order = require("../models/Order");

    // Orders are matched by the customer's phone number stored at order creation
    const orders = await Order.find({
      customerPhone: req.user.phone,
    })
      .populate("products.product")
      .populate("assignedManager", "name email")
      .populate("assignedWorker", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET MY PROFILE (CUSTOMER) =================
const getCustomerProfile = async (req, res) => {
  try {
    const customerResponse = req.user.toObject();
    delete customerResponse.password;

    return res.status(200).json({
      success: true,
      customer: customerResponse,
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
  customerSignup,
  customerLogin,
  getCustomerOrders,
  getCustomerProfile,
};
