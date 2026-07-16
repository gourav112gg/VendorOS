const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Notification = require("../models/Notification");

const createCustomerOrder = async (req, res) => {
  try {
    const { customerAddress, products } = req.body;

    if (!customerAddress || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer address and products are required",
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

      item.price = product.price;
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      company: req.user.company,
      customer: req.user._id,          // NEW
      customerName: req.user.name,
      customerPhone: req.user.phone,
      customerAddress,
      products,
      totalAmount,
      status: "Pending",
    });

    // Notify Owner
    const owner = await require("../models/User").findOne({
      company: req.user.company,
      role: "owner",
    });

    if (owner) {
      await Notification.create({
        company: req.user.company,
        user: owner._id,
        title: "New Customer Order",
        message: `${req.user.name} submitted a new service request.`,
        type: "Order",
      });
    }

    res.status(201).json({
      success: true,
      message: "Service request submitted successfully",
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

// ================= CUSTOMER ORDER HISTORY =================

const getCustomerOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      customer: req.user._id,
    })
      .populate("products.product")
      .populate("assignedManager", "name email phone")
      .populate("assignedWorker", "name email phone")
      .sort({ createdAt: -1 });

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

// ================= GET SINGLE CUSTOMER ORDER =================

const getCustomerOrderById = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
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

    res.status(200).json({
      success: true,
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
  createCustomerOrder,
  getCustomerOrders,
  getCustomerOrderById,
};