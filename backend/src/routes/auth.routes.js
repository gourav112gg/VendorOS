const express = require("express");
const router = express.Router();

const {
  ownerSignup,
  ownerLogin,
  managerLogin,
  workerLogin,
  customerLogin,
} = require("../controllers/auth.controller");
router.post("/owner/signup", ownerSignup);
router.post("/owner/login", ownerLogin);
router.post("/manager/login", managerLogin);
router.post("/worker/login", workerLogin);
router.post("/customer/login", customerLogin);
module.exports = router;