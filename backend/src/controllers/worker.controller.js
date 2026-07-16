const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Company = require("../models/Company");

// Create Worker
const createWorker = async (req, res) => {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "worker",
      isCustomer: false,
      company: req.user.company,
    });

    await Company.findByIdAndUpdate(req.user.company, {
      $push: { workers: worker._id },
    });

    const workerResponse = worker.toObject();
    delete workerResponse.password;

    return res.status(201).json({
      success: true,
      message: "Worker created successfully",
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

// Get All Workers
const getWorkers = async (req, res) => {
  try {
    const workers = await User.find({
      role: "worker",
      company: req.user.company,
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Worker
const updateWorker = async (req, res) => {
  try {
    const worker = await User.findOne({
      _id: req.params.id,
      role: "worker",
      company: req.user.company,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    const { name, email, phone } = req.body;

    if (name) worker.name = name;
    if (email) worker.email = email;
    if (phone) worker.phone = phone;

    await worker.save();

    const workerResponse = worker.toObject();
    delete workerResponse.password;

    return res.status(200).json({
      success: true,
      message: "Worker updated successfully",
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

// Delete Worker
const deleteWorker = async (req, res) => {
  try {
    const worker = await User.findOne({
      _id: req.params.id,
      role: "worker",
      company: req.user.company,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    await Company.findByIdAndUpdate(req.user.company, {
      $pull: { workers: worker._id },
    });

    await worker.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Worker deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Toggle Availability
const toggleAvailability = async (req, res) => {
  try {
    const worker = await User.findOne({
      _id: req.params.id,
      role: "worker",
      company: req.user.company,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    worker.isAvailable = !worker.isAvailable;
    await worker.save();

    return res.status(200).json({
      success: true,
      message: "Availability updated",
      isAvailable: worker.isAvailable,
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
  createWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
  toggleAvailability,
};