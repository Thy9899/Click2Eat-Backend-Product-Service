const Product = require("../models/product.model");
const cloudinary = require("../config/cloudinary");

// =====================================================
// Upload image buffer directly to Cloudinary
// (Used for multer memoryStorage)
// =====================================================
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "product_images" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url); // Return the uploaded image URL
      })
      .end(fileBuffer);
  });
};

// =====================================================
// Convert mongoose product document to clean API format
// =====================================================
const normalizeProduct = (product) => ({
  product_id: product._id,
  name: product.name,
  category: product.category,
  description: product.description,
  quantity: product.quantity,
  price: product.price,
  discount: product.discount,
  unit_price: product.unit_price,
  total: product.total,
  image: product.image, // Cloudinary image URL
  created_by: product.created_by,
});

// =====================================================
// GET ALL PRODUCTS
// =====================================================
const getAll = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json({
      success: true,
      list: products.map(normalizeProduct),
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================
const getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    res.json({
      success: true,
      product: normalizeProduct(product),
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// =====================================================
// CREATE NEW PRODUCT
// =====================================================
const create = async (req, res) => {
  try {
    const { name, category, description, quantity, price, discount } = req.body;

    // Check required fields
    if (
      !name ||
      !category ||
      !description ||
      !quantity ||
      !price ||
      discount == null
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    let cloudinaryUrl = null;

    // Upload product image to Cloudinary if provided
    if (req.file) {
      cloudinaryUrl = await uploadToCloudinary(req.file.buffer);
    }

    // Convert string values to numbers
    const qty = Number(quantity);
    const pr = Number(price);
    const disc = Number(discount);

    // Validate numbers
    if ([qty, pr, disc].some(isNaN)) {
      return res.status(400).json({
        success: false,
        error: "Quantity, price, discount must be numeric",
      });
    }

    // Auto calculations
    const unit_price = pr - (pr * disc) / 100; // Price after discount
    const total = qty * unit_price; // Total price x quantity

    // Get user from token (if available)
    const created_by = req.user?.username || "Unknown";

    // Create new product in DB
    const product = await Product.create({
      name,
      category,
      description,
      quantity: qty,
      price: pr,
      discount: disc,
      unit_price,
      total,
      image: cloudinaryUrl,
      created_by,
    });

    // Response
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: normalizeProduct(product),
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================
const update = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    const { name, category, description, quantity, price, discount } = req.body;

    let cloudinaryUrl = product.image;

    // If user uploaded new image → upload it to Cloudinary
    if (req.file) {
      cloudinaryUrl = await uploadToCloudinary(req.file.buffer);
    }

    // If fields not provided → use old values
    const newQty = quantity ? Number(quantity) : product.quantity;
    const newPrice = price ? Number(price) : product.price;
    const newDisc = discount ? Number(discount) : product.discount;

    // Recalculate values
    const unit_price = newPrice - (newPrice * newDisc) / 100;
    const total = newQty * unit_price;

    const created_by = req.user?.username || product.created_by;

    // Update DB record
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name || product.name,
        category: category || product.category,
        description: description || product.description,
        quantity: newQty,
        price: newPrice,
        discount: newDisc,
        unit_price,
        total,
        image: cloudinaryUrl,
        created_by,
      },
      { new: true } // Return updated document
    );

    res.json({
      success: true,
      message: "Product updated successfully",
      product: normalizeProduct(updatedProduct),
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// =====================================================
// DELETE PRODUCT
// =====================================================
const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    res.json({
      success: true,
      message: "Product deleted successfully",
      deletedId: req.params.id,
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = { getAll, getById, create, update, remove };
