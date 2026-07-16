const express = require("express");
const router = express.Router();

const {
  validateSchema,
  loginSchema,
  ownerSignupSchema,
  customerSignupSchema
} = require("../middleware/validateSchema");
const { createSignupRateLimiter } = require("../middleware/signupRateLimiter");

const {
  ownerSignup,
  login,
  reportFailure,
} = require("../controllers/auth.controller");

const {
  customerSignup,
} = require("../controllers/customer.controller");

const signupRateLimiter = createSignupRateLimiter(10, 60 * 60 * 1000); // 10/IP/hour

// Owner & Customer Signup with rate limiting + schema validation
router.post("/owner/signup", signupRateLimiter, validateSchema(ownerSignupSchema), ownerSignup);
router.post("/customer/signup", signupRateLimiter, validateSchema(customerSignupSchema), customerSignup);

// Unified login endpoints
router.post("/login", validateSchema(loginSchema), login);
router.post("/report-failure", reportFailure);

module.exports = router;