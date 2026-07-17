const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const { getProfile, updateProfile, promoteWorker } = require("../controllers/user.controller");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.patch("/promote", protect, promoteWorker);

module.exports = router;