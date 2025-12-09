require("dotenv").config(); // Load .env variables (PORT, DB credentials, etc.)

const express = require("express");
const morgan = require("morgan");
const connectDB = require("./src/util/db");
const productsRoutes = require("./src/routes/products.route");
const cors = require("cors");

const app = express();

// =========================================
// MIDDLEWARE
// =========================================

// Parse JSON request body
app.use(express.json());

// Log incoming requests (GET /api/products etc.)
app.use(morgan("dev"));

// Allow frontend (React, Vue, mobile apps...) to request this API
app.use(cors());

// =========================================
// DATABASE CONNECTION
// =========================================
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err);
  process.exit(1); // Stop server if DB connection fails
});

// =========================================
// STATIC FILES (Optional)
// This serves files stored in public/Images folder
// You can open images at: http://localhost:5003/Images/<filename>
// =========================================
app.use("/Images", express.static("public/Images"));

// =========================================
// API ROUTES
// All product-related endpoints start with /api
// Example: GET /api/products
// =========================================
app.use("/api", productsRoutes);

// =========================================
// START SERVER
// =========================================
const PORT = process.env.PORT || 5003;

app.listen(PORT, () =>
  console.log(`✅ Product service running on port ${PORT}`)
);
