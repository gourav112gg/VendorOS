const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ownerRoutes = require("./routes/owner.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const managerRoutes = require("./routes/manager.routes");
const workerRoutes = require("./routes/worker.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const orderRoutes = require("./routes/order.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const managerDashboardRoutes = require("./routes/managerDashboard.routes");
const customerRoutes = require("./routes/customer.routes");
const domainRoutes = require("./routes/domain.routes");
const templateRoutes = require("./routes/template.routes");


// Trust score controller (lightweight — no dedicated route file needed)
const protect = require("./middleware/auth.middleware");
const authorize = require("./middleware/role.middleware");
const { getTrustScore } = require("./controllers/trust.controller");
const { analyzeRisk } = require("./services/risk.service");

const app = express();
const compression = require("compression");

app.use(compression({ threshold: 1024 }));

// Restrict CORS to VendorOS production and local dev domains only — no wildcard
const allowedOrigins = [
  "https://vendoros-b2c1d.web.app",
  "https://vendoros-b2c1d.firebaseapp.com",
  "https://vendoros.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Default Cache-Control to prevent caching of sensitive dashboard data
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});

// --- Core Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/manager-dashboard", managerDashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/templates", templateRoutes);


// --- Trust Score (owner only) ---
app.get(
  "/api/trust-score",
  protect,
  authorize("owner"),
  getTrustScore
);

// --- Risk Engine (owner + manager) ---
app.post(
  "/api/risk/analyze",
  protect,
  authorize("owner", "manager"),
  analyzeRisk
);

// --- Health Check ---
app.get("/", (req, res) => {
  res.json({
    message: "VendorOS Backend Running",
    version: "1.0.0",
    status: "ok",
  });
});

module.exports = app;