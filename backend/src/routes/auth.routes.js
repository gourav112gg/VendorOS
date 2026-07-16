const express = require("express");
const router = express.Router();
const validateAuthInput = require("../middleware/validateAuthInput");

const {
  ownerSignup,
  ownerLogin,
  managerLogin,
  workerLogin,
  login,
  reportFailure,
} = require("../controllers/auth.controller");

const {
  customerSignup,
  customerLogin,
} = require("../controllers/customer.controller");

router.post("/owner/signup", validateAuthInput, ownerSignup);
router.post("/owner/login", validateAuthInput, ownerLogin);
router.post("/manager/login", validateAuthInput, managerLogin);
router.post("/worker/login", validateAuthInput, workerLogin);
router.post("/customer/signup", validateAuthInput, customerSignup);
router.post("/customer/login", validateAuthInput, customerLogin);

// Unified login endpoints
router.post("/login", validateAuthInput, login);
router.post("/report-failure", validateAuthInput, reportFailure);

module.exports = router;