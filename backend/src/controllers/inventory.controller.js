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

    if (!productName || !sku || quantity == null || price == null) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const existing = await Inventory.findOne({
      sku,
      company: req.user.company,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    const product = await Inventory.create({
      company: req.user.company,
      productName,
      category,
      sku,
      quantity,
      minimumStock,
      price,
      unit,
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
    });

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

    Object.assign(product, req.body);

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