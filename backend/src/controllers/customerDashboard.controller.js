const Order = require("../models/Order");

const customerDashboard = async (req, res) => {
  try {
    const myOrders = await Order.countDocuments({
      customerPhone: req.user.phone,
      company: req.user.company,
    });

    const pendingOrders = await Order.countDocuments({
      customerPhone: req.user.phone,
      company: req.user.company,
      status: "Pending",
    });

    const acceptedOrders = await Order.countDocuments({
      customerPhone: req.user.phone,
      company: req.user.company,
      status: "Accepted",
    });

    const packedOrders = await Order.countDocuments({
      customerPhone: req.user.phone,
      company: req.user.company,
      status: "Packed",
    });

    const deliveredOrders = await Order.countDocuments({
      customerPhone: req.user.phone,
      company: req.user.company,
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
  customerDashboard,
};