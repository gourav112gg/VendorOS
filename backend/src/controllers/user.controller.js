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
    const { name, phone } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          name: name.trim(), 
          phone: phone ? phone.trim() : undefined 
        } 
      },
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

module.exports = {
  getProfile,
  updateProfile,
};