// const Product = require("../models/productModel");
const Product = require("../models/productModel");
const db = require("../config/db"); // your MySQL connection
const fs = require("fs");// your MySQL connection
const multer = require("multer");
const path = require('path');

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


// Handle product creation with image upload
// exports.createProduct = async (req, res) => {
//   try {
//     let imagePath = null;

//     // Multer stores file info in req.file
//     if (req.file) {
//       imagePath = req.file.filename; // save just the filename
//     }

//     const { name, description, price, category } = req.body;

//     const product = await Product.create({
//       name,
//       description,
//       price,
//       category,
//       image: imagePath, // store filename
//     });

//     res.status(201).json({
//       message: 'Product added successfully',
//       product,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to add product', error: err.message });
//   }
// };

// Serve uploaded images
exports.getImage = (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, '../uploads', filename));
};

exports.getAllProducts = async (_req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Error fetching products",
      error: error.message || error.toString()
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
  try {
    const { category } = req.params;
    const { search = "", sort = "" } = req.query;

    let query = "SELECT * FROM products WHERE LOWER(category) = LOWER(?)";
    let params = [category];

    if (search) {
      query += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    if (sort === "low") {
      query += " ORDER BY price ASC";
    } else if (sort === "high") {
      query += " ORDER BY price DESC";
    } else {
      query += " ORDER BY id DESC";
    }

    const [rows] = await db.query(query, params);

    res.json(rows); // ✅ VERY IMPORTANT
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ✅ Search products
// productsController.js
exports.searchProducts = async (req, res) => {
  try {
    const searchQuery = (req.query.q || "").trim();
    const selectedCategory = req.query.category || "All";

    const keywords = searchQuery.split(" ").filter(Boolean);

    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (keywords.length > 0) {
      const conditions = keywords.map(() =>
        "(LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))"
      );
      sql += " AND " + conditions.join(" AND ");

      keywords.forEach((kw) => {
        const val = `%${kw}%`;
        params.push(val, val);
      });
    }

    if (selectedCategory !== "All") {
      sql += " AND category = ?";
      params.push(selectedCategory);
    }

    const [results] = await db.query(sql, params);

    res.json({ products: results }); // ✅ clean response
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Update Product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, category, image } = req.body;

  try {
    await db.query(
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
    await db.query("DELETE FROM products WHERE id=?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
