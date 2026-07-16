const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["owner", "manager", "worker", "customer"],
      required: true,
    },

    isCustomer: {
      type: Boolean,
      default: false,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    domains: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound uniqueness: allow one operator and one customer per email/phone
userSchema.index({ email: 1, isCustomer: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1, isCustomer: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("User", userSchema);