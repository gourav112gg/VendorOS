const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const User = require("../models/User");
const Notification = require("../models/Notification");
// ================= CREATE ORDER =================
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      products,
      deliveryDate,
      slaOverride,
      riskScore,
      expectedDelayDays,
    } = req.body;

    if (
      !customerName ||
      !customerPhone ||
      !customerAddress ||
      !products ||
      products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    let totalAmount = 0;

    // Validate Products (Batch query using $in to avoid N+1 queries)
    const productIds = products.map(item => item.product);
    const dbProducts = await Inventory.find({
      _id: { $in: productIds },
      company: req.user.company,
    });

    const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

    for (const item of products) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.productName} is out of stock`,
        });
      }

      totalAmount += product.price * item.quantity;

      // Save actual price
      item.price = product.price;
    }

    const order = await Order.create({
      company: req.user.company,
      customerName,
      customerPhone,
      customerAddress,
      products,
      totalAmount,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      slaOverride: slaOverride ?? null,
      riskScore: riskScore ?? null,
      expectedDelayDays: expectedDelayDays ?? null,
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

// ================= GET ALL ORDERS =================
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ company: req.user.company });

    const orders = await Order.find({
      company: req.user.company,
    })
      .populate("products.product")
      .populate("assignedManager", "name email")
      .populate("assignedWorker", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
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

// ================= GET ORDER BY ID =================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      company: req.user.company,
    })
      .populate("products.product")
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

// ================= UPDATE ORDER =================
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

    Object.assign(order, req.body);

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

// ================= DELETE ORDER =================
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

const assignManager = async (req, res) => {
  try {
    const { orderId, managerId } = req.body;

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

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const assignWorker = async (req, res) => {
  try {
    const { orderId, workerId } = req.body;

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
        message: "Worker is unavailable",
      });
    }

    order.assignedWorker = worker._id;
    order.status = "Accepted";

    await order.save();

    try {
      await Notification.create({
        recipient: worker._id,
        title: "New Task Assigned",
        message: `You have been assigned to order #${order._id.toString().substring(18)} for ${order.customerName}.`,
        order: order._id
      });
    } catch (notifError) {
      console.error("[Notification Error] Failed to create task assignment notification:", notifError);
    }

    return res.status(200).json({
      success: true,
      message: "Worker assigned successfully",
      order,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
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
      .populate("products.product")
      .populate("assignedManager", "name email")
      .populate("assignedWorker", "name email");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
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
  "Packed",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Status",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      assignedWorker: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    try {
      const recipients = [];
      if (order.assignedManager) {
        recipients.push(order.assignedManager);
      }
      const companyOwner = await User.findOne({ company: order.company, role: "owner" });
      if (companyOwner) {
        recipients.push(companyOwner._id);
      }
      const uniqueRecipients = [...new Set(recipients.map(id => id.toString()))];

      for (const recipientId of uniqueRecipients) {
        await Notification.create({
          recipient: recipientId,
          title: "Order Status Update",
          message: `Order #${order._id.toString().substring(18)} status has been updated to "${status}" by worker ${req.user.name}.`,
          order: order._id
        });
      }
    } catch (notifError) {
      console.error("[Notification Error] Failed to create status update notification:", notifError);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
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
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  assignManager,
  assignWorker,
  getMyOrders,
  updateOrderStatus,
};