const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ownerRoutes = require("./routes/owner.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/owner", ownerRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "VendorOS Backend Running",
  });
});

module.exports = app;