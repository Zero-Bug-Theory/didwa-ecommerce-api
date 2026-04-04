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

// ================= ADMIN ROUTES =================
router.get("/", verifyToken, isAdmin, userController.getAllUsers);
router.put("/:id", verifyToken, isAdmin, userController.updateUser);
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);
router.get("/users/:id", verifyToken, userController.getUserProfile);


// ================= USER PROFILE =================
router.get("/me", verifyToken, userController.getUserProfile);
router.put("/update", verifyToken, userController.updateProfile);


// ================= PROFILE IMAGE =================
router.post("/uploads", verifyToken, uploads.single("image"), userController.uploadProfileImage);

module.exports = router;
