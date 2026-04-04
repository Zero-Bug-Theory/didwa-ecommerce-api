const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const db = require("../config/db");

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

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

// multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// route example
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image required" });

  const streamUpload = (reqFile) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "didwa_products" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(reqFile.buffer).pipe(stream);
    });
  };

  try {
    const result = await streamUpload(req.file);
    const imageUrl = result.secure_url;

    const [dbResult] = await db.query(
      "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
      [req.body.name, req.body.description, req.body.price, req.body.category, imageUrl]
    );

    res.status(201).json({ message: "Product added successfully", image: imageUrl, id: dbResult.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
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
