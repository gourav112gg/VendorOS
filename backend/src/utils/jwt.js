const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for user id & role
 */
const generateToken = (id, role, expiresIn = "7d") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return jwt.sign({ id, role }, secret, { expiresIn });
};

/**
 * Sign a new JWT token with custom payload
 */
const signToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  signToken,
  verifyToken,
};
