const ownerDashboard = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Owner Dashboard",
    owner: req.user,
  });
};

module.exports = {
  ownerDashboard,
};