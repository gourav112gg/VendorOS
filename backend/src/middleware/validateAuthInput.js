const validator = require("validator");

// Superseded by Zod validateSchema.js on auth routes.
// Kept only for legacy non-auth routes that still use it.
const validateAuthInput = (req, res, next) => {
  const { email, password, name, phone, companyName } = req.body;

  // 1. Email validation
  if (email !== undefined) {
    if (typeof email !== "string" || email.length > 100) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
  }

  // 2. Password validation
  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 6 || password.length > 50) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
  }

  // 3. Name validation
  if (name !== undefined) {
    if (typeof name !== "string" || name.length < 2 || name.length > 50) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
  }

  // 4. Phone validation
  if (phone !== undefined) {
    if (typeof phone !== "string" || phone.length > 20) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
  }

  // 5. Company Name validation
  if (companyName !== undefined) {
    if (typeof companyName !== "string" || companyName.length < 2 || companyName.length > 100) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
  }

  next();
};

module.exports = validateAuthInput;
