const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("company");
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: user || req.user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, role, companyId, email } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const updateFields = {
      name: name.trim(),
      phone: phone && phone.trim() ? phone.trim() : undefined,
    };

    if (email && email.trim() && email.toLowerCase() !== req.user.email.toLowerCase()) {
      const targetEmail = email.toLowerCase().trim();
      const emailExists = await User.findOne({ email: targetEmail, isCustomer: req.user.isCustomer });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }

      const admin = require("../config/firebaseAdmin");
      try {
        const fbUser = await admin.auth().getUserByEmail(req.user.email);
        await admin.auth().updateUser(fbUser.uid, { email: targetEmail });
      } catch (fbErr) {
        console.error("Firebase update user error:", fbErr);
      }

      updateFields.email = targetEmail;
    }

    if (role && (role === "manager" || role === "worker") && req.user.role !== "owner") {
      updateFields.role = role;
    }

    if (companyId) {
      updateFields.company = companyId;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).populate("company");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const promoteWorker = async (req, res) => {
  try {
    const { workerId } = req.body;

    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only owners can promote worker accounts.",
      });
    }

    const worker = await User.findOne({
      _id: workerId,
      company: req.user.company,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found in your company",
      });
    }

    worker.role = "manager";
    await worker.save();

    return res.status(200).json({
      success: true,
      message: "Worker promoted to Manager successfully",
      user: worker,
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
  getProfile,
  updateProfile,
  promoteWorker,
};