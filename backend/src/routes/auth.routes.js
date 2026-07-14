const express = require("express");
const router = express.Router();

const {
  ownerSignup,
  ownerLogin,
  managerLogin,
} = require("../controllers/auth.controller");

router.post("/owner/signup", ownerSignup);
router.post("/owner/login", ownerLogin);
router.post("/manager/login", managerLogin);
module.exports = router;