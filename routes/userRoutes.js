const express = require("express");
const router = express.Router();
const db = require("../config/db"); // ✅ THIS LINE FIXES YOUR ERROR
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const multer = require("multer");
const path = require("path");

// ✅ DEFINE STORAGE FIRST
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + path.extname(file.originalname));
  },
});

// ✅ THEN DEFINE UPLOAD
const uploads = multer({ storage });


// ================= PRODUCT UPLOAD =================
router.post("/products", verifyToken, isAdmin, uploads.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

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


// ================= ADMIN ROUTES =================
router.get("/", verifyToken, isAdmin, userController.getAllUsers);
router.put("/:id", verifyToken, isAdmin, userController.updateUser);
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);
router.get("/users/:id", verifyToken, userController.getUserProfile);


// ================= USER PROFILE =================
router.get("/me", verifyToken, userController.getUserProfile);
router.put("/update", verifyToken, userController.updateProfile);


// ================= PROFILE IMAGE =================
router.post("/uploads", verifyToken, upload.single("image"), userController.uploadProfileImage);

module.exports = router;
