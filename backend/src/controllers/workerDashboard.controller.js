const Order = require("../models/Order");

const workerDashboard = async (req, res) => {
  try {
    const workerId = req.user._id;
    const company = req.user.company;

    const myOrders = await Order.countDocuments({
      company,
      assignedWorker: workerId,
    });

    const pendingOrders = await Order.countDocuments({
      company,
      assignedWorker: workerId,
      status: "Pending",
    });

    const acceptedOrders = await Order.countDocuments({
      company,
      assignedWorker: workerId,
      status: "Accepted",
    });

    const packedOrders = await Order.countDocuments({
      company,
      assignedWorker: workerId,
      status: "Packed",
    });

    const deliveredOrders = await Order.countDocuments({
      company,
      assignedWorker: workerId,
      status: "Delivered",
    });

    res.status(200).json({
      success: true,
      dashboard: {
        myOrders,
        pendingOrders,
        acceptedOrders,
        packedOrders,
        deliveredOrders,
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
  workerDashboard,
};