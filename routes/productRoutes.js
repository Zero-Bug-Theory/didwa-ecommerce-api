const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const productController = require("../controllers/productController");


// ✅ CLOUDINARY STORAGE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "didwa_products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });


// ✅ CREATE PRODUCT (ONLY ONE ROUTE!)
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const imageUrl = req.file.path;

    const [result] = await db.query(
      "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, category, imageUrl]
    );

    res.status(201).json({
      message: "Product added successfully",
      product: {
        id: result.insertId,
        name,
        image: imageUrl,
      },
    });

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ OTHER ROUTES
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
