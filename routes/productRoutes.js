const express = require("express");
const router = express.Router();

const db = require("../config/db"); // ✅ THIS LINE FIXES YOUR ERROR

const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const multer = require("multer");
const path = require("path");


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


router.get('/search', productController.searchProducts)


// ✅ Category route (FIXED)
router.get("/api/products/category/:category", productController.getProductsByCategory);

router.post("/products", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imagePath = req.file.filename; // store only filename

    const [rows] = await db.query(
      "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, category, imagePath]
    );

    res.status(201).json({
      message: "Product added successfully",
      product: {
        id: rows.insertId,
        name,
        image: imagePath,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.toString() });
  }
});

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

// Routes
router.post('/products', verifyToken,
  isAdmin, upload.single('image'), productController.createProduct);

// Serve images
router.get('/uploads/:filename', productController.getImage);



module.exports = router;
