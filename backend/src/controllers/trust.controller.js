const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const User = require("../models/User");
const Company = require("../models/Company");

/**
 * Compute a Trust Score (0–100) for a company based on three factors:
 *   1. Order Completion Rate  (50% weight)
 *   2. Inventory Health Rate  (30% weight)  — % items above minimum stock
 *   3. Worker Activity Score  (20% weight)  — % workers currently available
 *
 * Returns a TrustScoreRecord-shaped response matching the frontend type.
 */
const getTrustScore = async (req, res) => {
  try {
    const company = req.user.company;

    // ---- Factor 1: Order Completion Rate ----
    const totalOrders = await Order.countDocuments({ company });
    const deliveredOrders = await Order.countDocuments({
      company,
      status: "Delivered",
    });
    const orderCompletionRate =
      totalOrders > 0
        ? Math.round((deliveredOrders / totalOrders) * 100)
        : 100; // No orders yet = perfect baseline

    // ---- Factor 2: Inventory Level Rating ----
    const totalProducts = await Inventory.countDocuments({ company });
    const healthyStock = await Inventory.countDocuments({
      company,
      $expr: { $gt: ["$quantity", "$minimumStock"] },
    });
    const inventoryLevelRating =
      totalProducts > 0
        ? Math.round((healthyStock / totalProducts) * 100)
        : 100;

    // ---- Factor 3: Worker Activity Score ----
    const totalWorkers = await User.countDocuments({ company, role: "worker" });
    const availableWorkers = await User.countDocuments({
      company,
      role: "worker",
      isAvailable: true,
    });
    const workerActivityScore =
      totalWorkers > 0
        ? Math.round((availableWorkers / totalWorkers) * 100)
        : 100;

    // ---- Composite Score ----
    const score = Math.round(
      orderCompletionRate * 0.5 +
        inventoryLevelRating * 0.3 +
        workerActivityScore * 0.2
    );

    // Persist the computed score back to the company document
    await Company.findByIdAndUpdate(company, { trustScore: score });

    return res.status(200).json({
      success: true,
      trustScore: {
        score,
        factors: {
          orderCompletionRate,
          inventoryLevelRating,
          workerActivityScore,
        },
        updatedAt: new Date().toISOString(),
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

module.exports = { getTrustScore };
