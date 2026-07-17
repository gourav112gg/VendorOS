const JoinRequest = require("../models/JoinRequest");
const User = require("../models/User");
const Company = require("../models/Company");

// ================= SUBMIT NEW JOIN REQUEST =================
const createRequest = async (req, res) => {
  try {
    const { companyId, role } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    if (role !== "manager" && role !== "worker") {
      return res.status(400).json({
        success: false,
        message: "Role must be manager or worker",
      });
    }

    // Clear any previous pending requests for this user
    await JoinRequest.deleteMany({ user: req.user._id, status: "pending" });

    // Create the new request
    const request = await JoinRequest.create({
      user: req.user._id,
      company: companyId,
      role,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Join request submitted successfully. Waiting for owner approval.",
      request,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET PENDING REQUESTS (OWNER ONLY) =================
const getPendingRequests = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only company owners can view requests.",
      });
    }

    const requests = await JoinRequest.find({
      company: req.user.company,
      status: "pending",
    }).populate("user", "name email phone role");

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= APPROVE/REJECT REQUEST (OWNER ONLY) =================
const handleRequestAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only company owners can handle requests.",
      });
    }

    if (action !== "approve" && action !== "reject") {
      return res.status(400).json({
        success: false,
        message: "Action must be approve or reject",
      });
    }

    const joinRequest = await JoinRequest.findById(id);
    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (joinRequest.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Request belongs to another company.",
      });
    }

    if (joinRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${joinRequest.status}`,
      });
    }

    if (action === "approve") {
      joinRequest.status = "approved";
      await joinRequest.save();

      // Update the user's role and company
      await User.findByIdAndUpdate(joinRequest.user, {
        role: joinRequest.role,
        company: joinRequest.company,
      });
    } else {
      joinRequest.status = "rejected";
      await joinRequest.save();
    }

    return res.status(200).json({
      success: true,
      message: `Request ${action}d successfully.`,
      request: joinRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET MY CURRENT REQUEST =================
const getMyRequest = async (req, res) => {
  try {
    const request = await JoinRequest.findOne({
      user: req.user._id,
      status: "pending",
    }).populate("company", "companyName description address");

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createRequest,
  getPendingRequests,
  handleRequestAction,
  getMyRequest,
};
