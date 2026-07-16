const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

const ownerAnalytics = async (req, res) => {
  try {
    const company = req.user.company;

    const orders = await Order.find({ company });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const statusCount = {
      Pending: 0,
      Accepted: 0,
      Packed: 0,
      "Out For Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      if (statusCount[order.status] !== undefined) {
        statusCount[order.status]++;
      }
    });

    const inventory = await Inventory.find({ company });

    const inventoryValue = inventory.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders: orders.length,
        orderStatus: statusCount,
        totalProducts: inventory.length,
        inventoryValue,
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
  ownerAnalytics,
};