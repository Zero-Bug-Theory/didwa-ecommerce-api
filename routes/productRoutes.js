const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");


// ✅ CLOUDINARY STORAGE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "didwa_products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// ✅ CREATE PRODUCT
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    // ✅ Cloudinary gives URL automatically
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


router.get('/search', productController.searchProducts)


// ✅ Category route (FIXED)
router.get("/api/products/category/:category", productController.getProductsByCategory);

// router.post("/products", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
//   try {
//     const { name, description, price, category } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ message: "Image is required" });
//     }

//     const imagePath = req.file.filename; // store only filename

//     const [rows] = await db.query(
//       "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
//       [name, description, price, category, imagePath]
//     );

//     res.status(201).json({
//       message: "Product added successfully",
//       product: {
//         id: rows.insertId,
//         name,
//         image: imagePath,
//       },
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.toString() });
//   }
// });

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
