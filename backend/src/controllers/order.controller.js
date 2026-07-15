const User = require("../models/User");
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

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      company: req.user.company,
    })
      .populate("assignedManager", "name email")
      .populate("assignedWorker", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
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

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const {
      customerName,
      customerPhone,
      product,
      quantity,
      totalAmount,
      notes,
      status,
    } = req.body;

    if (customerName) order.customerName = customerName;
    if (customerPhone) order.customerPhone = customerPhone;
    if (product) order.product = product;
    if (quantity) order.quantity = quantity;
    if (totalAmount) order.totalAmount = totalAmount;
    if (notes) order.notes = notes;
    if (status) order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
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

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const assignWorker = async (req, res) => {
  try {
    const { orderId, workerId } = req.body;

    if (!orderId || !workerId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Worker ID are required",
      });
    }

    // Find Order
    const order = await Order.findOne({
      _id: orderId,
      company: req.user.company,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find Worker
    const worker = await User.findOne({
      _id: workerId,
      role: "worker",
      company: req.user.company,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    if (!worker.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Worker is currently unavailable",
      });
    }

    order.assignedWorker = worker._id;
    order.status = "Accepted";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Worker assigned successfully",
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
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      assignedWorker: req.user._id,
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

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "Accepted",
      "Processing",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      assignedWorker: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
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
const assignManager = async (req, res) => {
  try {
    const { orderId, managerId } = req.body;

    if (!orderId || !managerId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Manager ID are required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      company: req.user.company,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const manager = await User.findOne({
      _id: managerId,
      role: "manager",
      company: req.user.company,
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    order.assignedManager = manager._id;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Manager assigned successfully",
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

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  assignWorker,
  assignManager,
  getMyOrders,
  updateOrderStatus,
};