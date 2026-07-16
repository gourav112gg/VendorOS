const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

const ownerDashboard = async (req, res) => {
  try {
    const company = req.user.company;

    // Orders
    const totalOrders = await Order.countDocuments({ company });

    const pendingOrders = await Order.countDocuments({
      company,
      status: "Pending",
    });

    const acceptedOrders = await Order.countDocuments({
      company,
      status: "Accepted",
    });

    const packedOrders = await Order.countDocuments({
      company,
      status: "Packed",
    });

    const deliveredOrders = await Order.countDocuments({
      company,
      status: "Delivered",
    });

    // Revenue
    const revenue = await Order.aggregate([
      {
        $match: {
          company,
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    // Inventory
    const totalProducts = await Inventory.countDocuments({ company });

    const lowStock = await Inventory.countDocuments({
      company,
      $expr: {
        $lte: ["$quantity", "$minimumStock"],
      },
    });

    // Employees
    const totalManagers = await User.countDocuments({
      company,
      role: "manager",
    });

    const totalWorkers = await User.countDocuments({
      company,
      role: "worker",
    });

    const availableWorkers = await User.countDocuments({
      company,
      role: "worker",
      isAvailable: true,
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalOrders,
        pendingOrders,
        acceptedOrders,
        packedOrders,
        deliveredOrders,

        totalRevenue:
          revenue.length > 0 ? revenue[0].totalRevenue : 0,

        totalProducts,
        lowStock,

        totalManagers,
        totalWorkers,
        availableWorkers,
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
  ownerDashboard,
};