const express = require("express");
const router = express.Router();

const {
  validateSchema,
  loginSchema,
  ownerSignupSchema,
  customerSignupSchema,
  vendorSignupSchema
} = require("../middleware/validateSchema");
const { createSignupRateLimiter } = require("../middleware/signupRateLimiter");

const {
  ownerSignup,
  vendorSignup,
  login,
  reportFailure,
} = require("../controllers/auth.controller");

const {
  customerSignup,
} = require("../controllers/customer.controller");

const signupRateLimiter = createSignupRateLimiter(10, 60 * 60 * 1000); // 10/IP/hour

// Owner, Vendor, & Customer Signup with rate limiting + schema validation
router.post("/owner/signup", signupRateLimiter, validateSchema(ownerSignupSchema), ownerSignup);
router.post("/vendor/signup", signupRateLimiter, validateSchema(vendorSignupSchema), vendorSignup);
router.post("/customer/signup", signupRateLimiter, validateSchema(customerSignupSchema), customerSignup);

const rateLimiter = require("../middleware/rateLimiter");
const reportFailureLimiter = rateLimiter({ windowMs: 60000, max: 10, message: "Too many failure reports. Please wait." });

// Unified login endpoints
router.post("/login", validateSchema(loginSchema), login);
router.post("/report-failure", reportFailureLimiter, reportFailure);

module.exports = router;