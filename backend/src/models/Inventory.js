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
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },

    minimumStock: {
      type: Number,
      default: 10,
      min: [0, "Minimum stock cannot be negative"],
    },

    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per company to ensure tenant isolation and prevent cross-tenant SKU collisions
inventorySchema.index({ company: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);