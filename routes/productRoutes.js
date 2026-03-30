const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const multer = require("multer");

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });


// ✅ Category route (FIXED)
router.get("/category/:category", productController.getProductsByCategory);


// Add product route (admin only)
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  productController.createProduct
);

// Other product routes
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;