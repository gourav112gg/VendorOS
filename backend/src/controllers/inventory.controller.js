const Inventory = require("../models/Inventory");

// ================= CREATE PRODUCT =================
const createProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      sku,
      quantity,
      minimumStock,
      price,
      unit,
    } = req.body;

    // Validation
    if (
      !productName ||
      !category ||
      !sku ||
      quantity === undefined ||
      price === undefined ||
      !unit
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Check duplicate SKU
    const existingProduct = await Inventory.findOne({
      sku: sku.trim(),
      company: req.user.company,
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    const product = await Inventory.create({
      company: req.user.company,
      productName: productName.trim(),
      category: category.trim(),
      sku: sku.trim(),
      quantity,
      minimumStock: minimumStock || 0,
      price,
      unit: unit.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET ALL PRODUCTS =================
const getProducts = async (req, res) => {
  try {
    const products = await Inventory.find({
      company: req.user.company,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET PRODUCT BY ID =================
const getProductById = async (req, res) => {
  try {
    const product = await Inventory.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= UPDATE PRODUCT =================
const updateProduct = async (req, res) => {
  try {
    const product = await Inventory.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      productName,
      category,
      sku,
      quantity,
      minimumStock,
      price,
      unit,
    } = req.body;

    if (productName) product.productName = productName.trim();
    if (category) product.category = category.trim();
    if (sku) product.sku = sku.trim();
    if (quantity !== undefined) product.quantity = quantity;
    if (minimumStock !== undefined)
      product.minimumStock = minimumStock;
    if (price !== undefined) product.price = price;
    if (unit) product.unit = unit.trim();

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= DELETE PRODUCT =================
const deleteProduct = async (req, res) => {
  try {
    const product = await Inventory.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= UPDATE STOCK =================
const updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    const product = await Inventory.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.quantity = quantity;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product,
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
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
};