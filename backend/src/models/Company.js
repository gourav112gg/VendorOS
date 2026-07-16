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

    subscription: {
      tier: {
        type: String,
        enum: ["free", "growth", "scale"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "past_due", "canceled"],
        default: "active",
      },
      currentPeriodEnd: {
        type: Date,
        default: () => new Date(Date.now() + 1000 * 3600 * 24 * 30), // 30 days from now
      },
      razorpaySubscriptionId: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);