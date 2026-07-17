const admin = require("../config/firebaseAdmin");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ================= CUSTOMER SIGNUP =================
const customerSignup = async (req, res) => {
  try {
    const { idToken, name, email, phone } = req.body;
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

    const queryConditions = [{ email: normalizedEmail, isCustomer: true }];
    if (phone && phone.trim()) {
      queryConditions.push({ phone: phone.trim(), isCustomer: true });
    }

    const existingUser = await User.findOne({
      $or: queryConditions
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support",
      });
    }

    const customer = await User.create({
      name,
      email: normalizedEmail,
      phone: phone && phone.trim() ? phone.trim() : undefined,
      role: "customer",
      isCustomer: true,
    });

    const token = generateToken(customer._id, customer.role);

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      token,
      customer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again or contact support",
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
  getCustomerOrders,
  getCustomerProfile,
};
