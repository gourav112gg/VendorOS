const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized",
        });
      }

      // Check if user's company is suspended
      if (req.user.company) {
        const companyObj = await Company.findById(req.user.company);
        if (companyObj && companyObj.status === "suspended") {
          return res.status(403).json({
            success: false,
            message: "Company account is currently suspended by Super Admin. Please contact administration.",
          });
        }
      }

      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = protect;