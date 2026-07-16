const Order = require("../models/Order");
const User = require("../models/User");

const managerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;
    const company = req.user.company;

    const totalOrders = await Order.countDocuments({
      company,
      assignedManager: managerId,
    });

    const pendingOrders = await Order.countDocuments({
      company,
      assignedManager: managerId,
      status: "Pending",
    });

    const acceptedOrders = await Order.countDocuments({
      company,
      assignedManager: managerId,
      status: "Accepted",
    });

    const packedOrders = await Order.countDocuments({
      company,
      assignedManager: managerId,
      status: "Packed",
    });

    const deliveredOrders = await Order.countDocuments({
      company,
      assignedManager: managerId,
      status: "Delivered",
    });

    const availableWorkers = await User.countDocuments({
      company,
      role: "worker",
      isAvailable: true,
    });

    const busyWorkers = await User.countDocuments({
      company,
      role: "worker",
      isAvailable: false,
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalOrders,
        pendingOrders,
        acceptedOrders,
        packedOrders,
        deliveredOrders,
        availableWorkers,
        busyWorkers,
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
  managerDashboard,
};