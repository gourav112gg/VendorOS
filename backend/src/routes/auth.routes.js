const express = require("express");
const router = express.Router();

const {
  ownerSignup,
  ownerLogin,
} = require("../controllers/auth.controller");

router.post("/owner/signup", ownerSignup);
router.post("/owner/login", ownerLogin);

module.exports = router;