const Template = require("../models/Template");

// ================= CREATE TEMPLATE =================
const createTemplate = async (req, res) => {
  try {
    const { title, domainId, domainName, checklist } = req.body;

    if (!title || !domainId || !domainName || !checklist) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const template = await Template.create({
      company: req.user.company,
      manager: req.user._id,
      title: title.trim(),
      domain: domainId,
      domainName: domainName.trim(),
      checklist,
    });

    return res.status(201).json({
      success: true,
      message: "Template created successfully",
      template,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET TEMPLATES =================
const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({
      company: req.user.company,
      manager: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= DELETE TEMPLATE =================
const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      manager: req.user._id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    await template.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Template deleted successfully",
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
  createTemplate,
  getTemplates,
  deleteTemplate,
};
