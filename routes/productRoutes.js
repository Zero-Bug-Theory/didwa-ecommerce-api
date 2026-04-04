const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary"); // your cloudinary config
const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// ✅ Multer setup for temporary local storage
const storage = multer.memoryStorage(); // store file in memory
const upload = multer({ storage });

// ✅ CREATE PRODUCT
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    // Upload file buffer directly to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "didwa_products" },
      async (error, cloudResult) => {
        if (error) return res.status(500).json({ message: "Cloudinary upload failed", error });

        // Save product in DB
        const [dbResult] = await db.query(
          "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
          [name, description, price, category, cloudResult.secure_url]
        );

        res.status(201).json({
          message: "Product added successfully",
          product: {
            id: dbResult.insertId,
            name,
            image: cloudResult.secure_url,
          },
        });
      }
    );

    // Pipe multer file buffer into Cloudinary uploader
    result.end(req.file.buffer);

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;


// ✅ OTHER ROUTES
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
