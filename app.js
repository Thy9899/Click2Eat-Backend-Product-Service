require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./src/util/db");
const productsRoutes = require("./src/routes/products.route");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

// Connect DB
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err);
  process.exit(1);
});

// Static images folder
app.use("/Images", express.static("public/Images"));

// Routes
app.use("/api", productsRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () =>
  console.log(`✅ Product service running on port ${PORT}`)
);
