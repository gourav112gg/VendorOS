const express = require("express");
const router = express.Router();

const {
  ownerSignup,
  ownerLogin,
  managerLogin,
  workerLogin,
} = require("../controllers/auth.controller");

const {
  customerSignup,
  customerLogin,
} = require("../controllers/customer.controller");

router.post("/owner/signup", ownerSignup);
router.post("/owner/login", ownerLogin);
router.post("/manager/login", managerLogin);
router.post("/worker/login", workerLogin);
router.post("/customer/signup", customerSignup);
router.post("/customer/login", customerLogin);

module.exports = router;