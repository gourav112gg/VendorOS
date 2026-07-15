const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
    },

    sku: {
      type: String,
      unique: true,
      required: true,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    quantity: {
      type: Number,
      default: 0,
    },

    minimumStock: {
      type: Number,
      default: 10,
    },

    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);