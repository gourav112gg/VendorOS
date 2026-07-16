const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ================= CREATE ORDER =================
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      products,
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

    // Validate Products
    for (const item of products) {
      const product = await Inventory.findOne({
        _id: item.product,
        company: req.user.company,
      });

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

      // Save product price
      item.price = product.price;

      // Reduce Inventory
      product.quantity -= item.quantity;
      await product.save();

      // Low Stock Notification
      if (product.quantity <= product.minimumStock) {
        const owner = await User.findOne({
          company: req.user.company,
          role: "owner",
        });

        if (owner) {
          await Notification.create({
            company: req.user.company,
            user: owner._id,
            title: "Low Stock Alert",
            message: `${product.productName} stock is low (${product.quantity} left)`,
            type: "Inventory",
            isRead: false,
          });
        }
      }
    }

    // Create Order
    const order = await Order.create({
      company: req.user.company,
      customerName,
      customerPhone,
      customerAddress,
      products,
      totalAmount,
      status: "Pending",
    });

    // Notify Owner
    const owner = await User.findOne({
      company: req.user.company,
      role: "owner",
    });

    if (owner) {
      await Notification.create({
        company: req.user.company,
        user: owner._id,
        title: "New Order",
        message: `New order received from ${customerName}`,
        type: "Order",
        isRead: false,
      });
    }

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
    const orders = await Order.find({
      company: req.user.company,
    })
      .populate("products.product")
      .populate("assignedManager", "name email phone")
      .populate("assignedWorker", "name email phone")
      .sort({ createdAt: -1 });

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

// ================= GET ORDER BY ID =================
const getOrderById = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      company: req.user.company,
    })
      .populate("products.product")
      .populate("assignedManager", "name email phone")
      .populate("assignedWorker", "name email phone");

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



// ================= ASSIGN MANAGER =================
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

    // Notification for Manager
    await Notification.create({
      company: req.user.company,
      user: manager._id,
      title: "New Order Assigned",
      message: `Order #${order._id} has been assigned to you.`,
      type: "Manager",
      isRead: false,
    });

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

// ================= ASSIGN WORKER =================
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

    // Worker becomes busy
    worker.isAvailable = false;

    await order.save();
    await worker.save();

    // Notification for Worker
    await Notification.create({
      company: req.user.company,
      user: worker._id,
      title: "New Delivery Assigned",
      message: `You have been assigned Order #${order._id}`,
      type: "Worker",
      isRead: false,
    });

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


// ================= GET MY ORDERS =================
const getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      assignedWorker: req.user._id,
    })
      .populate("products.product")
      .populate("assignedManager", "name email phone")
      .populate("assignedWorker", "name email phone")
      .sort({ createdAt: -1 });

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

// ================= UPDATE ORDER STATUS =================
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

    // Worker becomes available again
    if (status === "Delivered" || status === "Cancelled") {
      const worker = await User.findById(req.user._id);

      if (worker) {
        worker.isAvailable = true;
        await worker.save();
      }
    }

    // Notify Owner
    const owner = await User.findOne({
      company: order.company,
      role: "owner",
    });

    if (owner) {
      await Notification.create({
        company: order.company,
        user: owner._id,
        title: "Order Status Updated",
        message: `Order #${order._id} is now ${status}`,
        type: "Order",
        isRead: false,
      });
    }

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