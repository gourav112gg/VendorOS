const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/SuperAdmin");

const protectSuperAdmin = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.isSuperAdmin) {
        return res.status(401).json({
          success: false,
          message: "Not authorized as Super Admin",
        });
      }

      const superAdmin = await SuperAdmin.findById(decoded.id);

      if (!superAdmin) {
        return res.status(401).json({
          success: false,
          message: "Super Admin account not found",
        });
      }

      req.superAdmin = superAdmin;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized. Super Admin token missing.",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired Super Admin token",
    });
  }
};

module.exports = protectSuperAdmin;
