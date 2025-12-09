const express = require("express");
const router = express.Router(); // Create router instance

const productsController = require("../controller/products.controller");
const authenticateToken = require("../middleware/authMiddleware");
const multer = require("multer");

// ================================================
// MULTER memory storage (image uploaded as buffer)
// ================================================
const upload = multer({ storage: multer.memoryStorage() });

// ====================================================
// PRODUCT ROUTES
// ====================================================

// ---------------------------
// GET ALL PRODUCTS
// Public route → No login required
// ---------------------------
router.get("/products", productsController.getAll);

// ---------------------------
// GET PRODUCT BY ID
// Public route
// ---------------------------
router.get("/products/:id", productsController.getById);

// ---------------------------
// CREATE NEW PRODUCT
// Protected route → requires token
// "image" = name of the file input (form-data)
// ---------------------------
router.post(
  "/products",
  authenticateToken, // Must login first
  upload.single("image"), // Handle image upload using multer
  productsController.create
);

// ---------------------------
// UPDATE PRODUCT
// Protected route
// Upload new image if included
// ---------------------------
router.put(
  "/products/:id",
  authenticateToken,
  upload.single("image"),
  productsController.update
);

// ---------------------------
// DELETE PRODUCT
// Protected route
// ---------------------------
router.delete("/products/:id", authenticateToken, productsController.remove);

// Export router so it can be used in server.js
module.exports = router;
