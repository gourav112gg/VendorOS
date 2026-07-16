const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  getNotifications,
  markAsRead,
} = require("../controllers/notification.controller");

router.get("/", protect, getNotifications);

router.patch("/:id", protect, markAsRead);

module.exports = router;