const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const multer = require("multer");
const upload = multer({ storage });


// ✅ UPLOAD IMAGE
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

router.post("/products/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "products" }, 
      async (error, result) => {
        if (error) return res.status(500).json({ message: "Image upload failed", error });
        
        // Save product in DB
        const [rows] = await db.query(
          "INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)",
          [name, description, price, category, result.secure_url]
        );

        res.status(201).json({ message: "Product added successfully", product: { id: rows.insertId, name, image: result.secure_url } });
      }
    );

    // Convert buffer to stream
    result.end(req.file.buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.toString() });
  }
});


// Admin-only routes
router.get("/", verifyToken, isAdmin, userController.getAllUsers);
router.put("/:id", verifyToken, isAdmin, userController.updateUser);
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);
router.get('/users/:id', verifyToken, userController.getUserProfile);

// ✅ GET LOGGED-IN USER
router.get("/me", verifyToken, userController.getUserProfile);

// ✅ UPDATE PROFILE
router.put("/update", verifyToken, userController.updateProfile);

router.post("/upload", verifyToken, upload.single("image"), userController.uploadProfileImage);
module.exports = router;



