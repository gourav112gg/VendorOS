const CompanyPolicy = require("../models/CompanyPolicy");

const createPolicy = async (req, res) => {
  try {
    const { topic, answer } = req.body;
    if (!topic || !answer) {
      return res.status(400).json({ success: false, message: "topic and answer are required" });
    }
    const policy = await CompanyPolicy.create({ company: req.user.company, topic, answer });
    return res.status(201).json({ success: true, policy });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getPolicies = async (req, res) => {
  try {
    const policies = await CompanyPolicy.find({ company: req.user.company }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: policies.length, policies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const policy = await CompanyPolicy.findOne({ _id: req.params.id, company: req.user.company });
    if (!policy) return res.status(404).json({ success: false, message: "Policy not found" });
    Object.assign(policy, req.body);
    await policy.save();
    return res.status(200).json({ success: true, policy });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deletePolicy = async (req, res) => {
  try {
    const policy = await CompanyPolicy.findOne({ _id: req.params.id, company: req.user.company });
    if (!policy) return res.status(404).json({ success: false, message: "Policy not found" });
    await policy.deleteOne();
    return res.status(200).json({ success: true, message: "Policy deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { createPolicy, getPolicies, updatePolicy, deletePolicy };