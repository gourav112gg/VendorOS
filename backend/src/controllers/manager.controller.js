const admin = require("../config/firebaseAdmin");
const User = require("../models/User");
const Company = require("../models/Company");

// Create Manager (Owner Only)
const createManager = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail, isCustomer: false },
        { phone, isCustomer: false }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support",
      });
    }

    // 1. Create User in Firebase Authentication
    try {
      await admin.auth().createUser({
        email: normalizedEmail,
        password,
        displayName: name,
        phoneNumber: phone || undefined
      });
    } catch (fbErr) {
      console.error("[Firebase Manager Creation Error]", fbErr.message);
      return res.status(400).json({
        success: false,
        message: "Something went wrong, please try again or contact support"
      });
    }

    // 2. Create User record in MongoDB (no password saved)
    const manager = await User.create({
      name,
      email: normalizedEmail,
      phone,
      role: "manager",
      isCustomer: false,
      company: req.user.company,
    });

    await Company.findByIdAndUpdate(req.user.company, {
      $push: {
        managers: manager._id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Manager created successfully",
      manager,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong, please try again or contact support",
    });
  }
};

// Get All Managers (Owner Only)
const getManagers = async (req, res) => {
  try {
    const managers = await User.find({
      role: "manager",
      company: req.user.company,
    });

    return res.status(200).json({
      success: true,
      count: managers.length,
      managers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Manager
const updateManager = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      _id: id,
      role: "manager",
      company: req.user.company,
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    const { name, email, phone } = req.body;

    if (name) manager.name = name;
    if (email) manager.email = email;
    if (phone) manager.phone = phone;

    await manager.save();

    const managerResponse = manager.toObject();
    delete managerResponse.password;

    return res.status(200).json({
      success: true,
      message: "Manager updated successfully",
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

// Delete Manager
const deleteManager = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      _id: id,
      role: "manager",
      company: req.user.company,
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    await Company.findByIdAndUpdate(req.user.company, {
      $pull: {
        managers: manager._id,
      },
    });

    await manager.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Manager deleted successfully",
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
  createManager,
  getManagers,
  updateManager,
  deleteManager,
};