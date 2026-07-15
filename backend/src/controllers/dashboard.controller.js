const Order = require("../models/Order");
const User = require("../models/User");

const getDashboard = async (req, res) => {
  try {
    const company = req.user.company;

    const totalOrders = await Order.countDocuments({ company });
    const pendingOrders = await Order.countDocuments({ company, status: "Pending" });
    const acceptedOrders = await Order.countDocuments({ company, status: "Accepted" });
    const processingOrders = await Order.countDocuments({ company, status: "Processing" });
    const completedOrders = await Order.countDocuments({ company, status: "Completed" });

    const revenue = await Order.aggregate([
      {
        $match: {
          company: req.user.company,
          status: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalManagers = await User.countDocuments({
      company,
      role: "manager",
    });

    const totalWorkers = await User.countDocuments({
      company,
      role: "worker",
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalOrders,
        pendingOrders,
        acceptedOrders,
        processingOrders,
        completedOrders,
        totalRevenue: revenue.length ? revenue[0].totalRevenue : 0,
        totalManagers,
        totalWorkers,
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

module.exports = { getDashboard };