const mongoose = require("mongoose");

const companyPolicySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      // e.g. "leave policy", "return policy", "working hours"
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyPolicy", companyPolicySchema);