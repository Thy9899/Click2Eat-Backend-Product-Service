const express = require("express");
const productsController = require("../controller/products.controller");
const authenticateToken = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/Images"),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage });
const router = express.Router();

router.get("/products", productsController.getAll);
router.get("/products/:id", productsController.getById);

router.post(
  "/products",
  authenticateToken,
  upload.single("image"),
  productsController.create
);

router.put(
  "/products/:id",
  authenticateToken,
  upload.single("image"),
  productsController.update
);

router.delete("/products/:id", authenticateToken, productsController.remove);

module.exports = router;
