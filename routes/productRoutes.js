const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const db = require("../config/db");

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

router.post("/", verifyToken, isAdmin, upload.single("image"), productController.createProduct);


// ✅ OTHER ROUTES
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
