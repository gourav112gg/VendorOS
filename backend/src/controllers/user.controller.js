const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: req.user,
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
    const { name, phone, role, companyId } = req.body;
    
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