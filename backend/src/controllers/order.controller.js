const Order = require("../models/Order");

// Create Order
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      product,
      quantity,
      totalAmount,
      notes,
    } = req.body;

    const order = await Order.create({
      customerName,
      customerPhone,
      product,
      quantity,
      totalAmount,
      notes,
      company: req.user.company,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      company: req.user.company,
    })
      .populate("assignedManager", "name email")
      .populate("assignedWorker", "name email");

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

module.exports = {
  createOrder,
  getOrders,
};