const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },

    customerAddress: {
      type: String,
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
    },

    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Packed",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    // 🆕 ADDED for voice-based task updates
    checklist: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending",
        },
        verifiedBy: {
          type: String,
          enum: ["manual", "voice"],
          default: "manual",
        },
      },
    ],

    voiceUpdateLog: [
      {
        transcript: String,
        matchedItemIds: [mongoose.Schema.Types.ObjectId],
        method: {
          type: String,
          enum: ["fuzzy", "llm", "none"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deliveryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);