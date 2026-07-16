const Domain = require("../models/Domain");

// ================= CREATE DOMAIN =================
const createDomain = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Domain name is required",
      });
    }

    // Check for duplicate domain name within the same company
    const existing = await Domain.findOne({
      company: req.user.company,
      name: name.trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Domain already exists for this company",
      });
    }

    const domain = await Domain.create({
      company: req.user.company,
      name: name.trim(),
      type: type ? type.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Domain created successfully",
      domain,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET ALL DOMAINS =================
const getDomains = async (req, res) => {
  try {
    const domains = await Domain.find({
      company: req.user.company,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: domains.length,
      domains,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET DOMAIN BY ID =================
const getDomainById = async (req, res) => {
  try {
    const domain = await Domain.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    return res.status(200).json({
      success: true,
      domain,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= UPDATE DOMAIN =================
const updateDomain = async (req, res) => {
  try {
    const domain = await Domain.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    const { name, type, status } = req.body;

    if (name) domain.name = name.trim();
    if (type !== undefined) domain.type = type.trim();
    if (status && ["Active", "Inactive"].includes(status)) {
      domain.status = status;
    }

    await domain.save();

    return res.status(200).json({
      success: true,
      message: "Domain updated successfully",
      domain,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= DELETE DOMAIN =================
const deleteDomain = async (req, res) => {
  try {
    const domain = await Domain.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    await domain.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Domain deleted successfully",
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
  createDomain,
  getDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
};
