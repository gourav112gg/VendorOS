const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

// ================= SALES REPORT =================
const salesReport = async (req, res) => {
  try {
    const company = req.user.company;

    const orders = await Order.find({ company });

    const totalOrders = orders.length;

    const completedOrders = orders.filter(
      (order) =>
        order.status === "Completed" ||
        order.status === "Delivered"
    ).length;

    const pendingOrders = orders.filter(
      (order) => order.status === "Pending"
    ).length;

    const acceptedOrders = orders.filter(
      (order) => order.status === "Accepted"
    ).length;

    const packedOrders = orders.filter(
      (order) => order.status === "Packed"
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.status === "Cancelled"
    ).length;

    const totalRevenue = orders
      .filter(
        (order) =>
          order.status === "Completed" ||
          order.status === "Delivered"
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return res.status(200).json({
      success: true,
      report: {
        totalOrders,
        completedOrders,
        pendingOrders,
        acceptedOrders,
        packedOrders,
        cancelledOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= ORDER REPORT =================
const orderReport = async (req, res) => {
  try {
    const company = req.user.company;

    const orders = await Order.find({ company })
      .populate("assignedManager", "name email")
      .populate("assignedWorker", "name email")
      .populate("products.product");

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

// ================= INVENTORY REPORT =================
const inventoryReport = async (req, res) => {
  try {
    const company = req.user.company;

    const inventory = await Inventory.find({ company });

    const totalProducts = inventory.length;

    const totalStock = inventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const inventoryValue = inventory.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const lowStockProducts = inventory.filter(
      (item) => item.quantity <= item.minimumStock
    );

    return res.status(200).json({
      success: true,
      report: {
        totalProducts,
        totalStock,
        inventoryValue,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
      },
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
  salesReport,
  orderReport,
  inventoryReport,
};