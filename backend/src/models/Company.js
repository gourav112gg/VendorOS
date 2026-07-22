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

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
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
      manualOverride: {
        active: {
          type: Boolean,
          default: false,
        },
        tier: {
          type: String,
          enum: ["free", "growth", "scale"],
          default: "free",
        },
        setBy: {
          type: String,
          default: "",
        },
        setAt: {
          type: Date,
          default: null,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);