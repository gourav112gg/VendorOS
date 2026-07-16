const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ownerRoutes = require("./routes/owner.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const managerRoutes = require("./routes/manager.routes");
const workerRoutes = require("./routes/worker.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const orderRoutes = require("./routes/order.routes");const dashboardRoutes = require("./routes/dashboard.routes");
const managerDashboardRoutes = require("./routes/managerDashboard.routes");
const workerDashboardRoutes = require("./routes/workerDashboard.routes");
const reportRoutes = require("./routes/report.routes");
const notificationRoutes = require("./routes/notification.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const customerRoutes = require("./routes/customer.routes");
const customerDashboardRoutes = require("./routes/customerDashboard.routes");
const customerOrderRoutes = require("./routes/customerOrder.routes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/worker-dashboard", workerDashboardRoutes);
app.use("/api/manager-dashboard", managerDashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/customer/dashboard", customerDashboardRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "VendorOS Backend Running",
  });
});

module.exports = app;