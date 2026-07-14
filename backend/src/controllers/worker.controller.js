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
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "worker",
      company: req.user.company,
    });

    await Company.findByIdAndUpdate(req.user.company, {
      $push: {
        workers: worker._id,
      },
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

module.exports = {
  createWorker,
  getWorkers,
};