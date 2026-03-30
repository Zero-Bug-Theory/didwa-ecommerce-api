// const Product = require("../models/productModel");
const Product = require("../models/productModel");
const db = require("../config/db"); // your MySQL connection
const fs = require("fs");// your MySQL connection
const multer = require("multer");

// Set up multer to store uploaded images in "uploads/" folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ✅ Create product (admin only)
// productController.js
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await Product.create(name, description, price, image, category);

    res.status(201).json({ message: "Product added successfully", productId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getAllProducts = async (_req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

exports.getProductById = (req, res) => {
  Product.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
};


///Get product by Category
exports.getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  const { search, sort } = req.query;

  try {
    const products = await Product.getProductsByCategory(
      category,
      search,
      sort
    );

    res.json(products);

  } catch (error) {
    console.error("CATEGORY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Search products
exports.searchProducts = (req, res) => {
  const searchQuery = req.query.q || "";
  const selectedCategory = req.query.category || "All";

  let sql = "SELECT * FROM products WHERE name LIKE ?";
  const params = [`%${searchQuery}%`];

  if (selectedCategory !== "All") {
    sql += " AND category = ?";
    params.push(selectedCategory);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results); // returns array of products
  });
};

// Update Product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, category, image } = req.body;

  try {
    await db.promise().query(
      "UPDATE products SET name=?, price=?, description=?, category=?, image=? WHERE id=?",
      [name, price, description, category, image, id]
    );
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query("DELETE FROM products WHERE id=?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};