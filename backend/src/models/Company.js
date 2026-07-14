const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    minimumOrderValue: {
      type: Number,
      default: 0,
    },

    minimumOrderQuantity: {
      type: Number,
      default: 0,
    },

    trustScore: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);