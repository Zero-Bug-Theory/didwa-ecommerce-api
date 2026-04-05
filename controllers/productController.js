const db = require("../config/db"); // your MySQL connection
const cloudinary = require("../config/cloudinary");

// --------------------------
// Create Product (Admin Only)
// --------------------------


exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "didwa_products_images" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Image upload failed", error });
        }

        const imageUrl = result.secure_url; // public URL

        // Save product to DB
        const [dbResult] = await db.query(
          "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
          [name, description, price, category, imageUrl]
        );

        res.status(201).json({
          message: "Product added successfully",
          product: {
            id: dbResult.insertId,
            name,
            image: imageUrl,
            description,
            price,
            category,
          },
        });
      }
    );

    // Convert buffer to stream
    result.end(req.file.buffer);

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --------------------------
// Get All Products
// --------------------------
exports.getAllProducts = async (_req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products ORDER BY id DESC");
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --------------------------
// Get Product By ID
// --------------------------
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET PRODUCT BY ID ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --------------------------
// Get Products By Category
// --------------------------
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const [rows] = await db.query("SELECT * FROM products WHERE LOWER(category) = LOWER(?)", [category]);
    res.json(rows);
  } catch (err) {
    console.error("GET PRODUCTS BY CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --------------------------
// Search Products
// --------------------------
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
      sql += " AND LOWER(category) = LOWER(?)";
      params.push(selectedCategory);
    }

    const [results] = await db.query(sql, params);
    res.json({results});
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --------------------------
// Update Product
// --------------------------
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, category } = req.body;

  let imageUrl = null;
  if (req.file && req.file.path) {
    imageUrl = req.file.path; // new Cloudinary URL
  }

  try {
    const query = imageUrl
      ? "UPDATE products SET name=?, price=?, description=?, category=?, image=? WHERE id=?"
      : "UPDATE products SET name=?, price=?, description=?, category=? WHERE id=?";
    const params = imageUrl
      ? [name, price, description, category, imageUrl, id]
      : [name, price, description, category, id];

    await db.query(query, params);
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --------------------------
// Delete Product
// --------------------------
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM products WHERE id=?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
