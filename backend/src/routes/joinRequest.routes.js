const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createRequest,
  getPendingRequests,
  handleRequestAction,
  getMyRequest,
} = require("../controllers/joinRequest.controller");

router.post("/", protect, createRequest);
router.get("/pending", protect, getPendingRequests);
router.patch("/:id", protect, handleRequestAction);
router.get("/my-pending", protect, getMyRequest);

module.exports = router;
