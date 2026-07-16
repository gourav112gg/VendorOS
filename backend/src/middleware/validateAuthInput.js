const validator = require("validator");

const validateAuthInput = (req, res, next) => {
  const { email, password, name, phone, companyName } = req.body;

  // 1. Email validation
  if (email !== undefined) {
    if (typeof email !== "string" || email.length > 100) {
      return res.status(400).json({ success: false, message: "Invalid email payload" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
  }

  // 2. Password validation
  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 6 || password.length > 50) {
      return res.status(400).json({ success: false, message: "Password must be between 6 and 50 characters" });
    }
  }

  // 3. Name validation
  if (name !== undefined) {
    if (typeof name !== "string" || name.length < 2 || name.length > 50) {
      return res.status(400).json({ success: false, message: "Name must be between 2 and 50 characters" });
    }
  }

  // 4. Phone validation
  if (phone !== undefined) {
    if (typeof phone !== "string" || phone.length > 20) {
      return res.status(400).json({ success: false, message: "Phone number is too long" });
    }
  }

  // 5. Company Name validation
  if (companyName !== undefined) {
    if (typeof companyName !== "string" || companyName.length < 2 || companyName.length > 100) {
      return res.status(400).json({ success: false, message: "Company name must be between 2 and 100 characters" });
    }
  }

  next();
};

module.exports = validateAuthInput;
