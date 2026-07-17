const Company = require("../models/Company");

const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}, "companyName description trustScore subscription createdAt");
    return res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateMyCompany = async (req, res) => {
  try {
    const { description, address, minimumOrderValue } = req.body;

    // Find company where owner is req.user._id
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found for this owner",
      });
    }

    if (description !== undefined) company.description = description;
    if (address !== undefined) company.address = address;
    if (minimumOrderValue !== undefined) company.minimumOrderValue = minimumOrderValue;

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company,
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
  getAllCompanies,
  updateMyCompany,
};
