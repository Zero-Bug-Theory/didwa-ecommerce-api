const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// Admin-only routes
router.get("/", verifyToken, isAdmin, userController.getAllUsers);
router.put("/:id", verifyToken, isAdmin, userController.updateUser);
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);
router.get('/users/:id', verifyToken, userController.getUserProfile);

// ✅ GET LOGGED-IN USER
router.get("/me", verifyToken, userController.getUserProfile);

// ✅ UPDATE PROFILE
router.put("/update", verifyToken, userController.updateProfile);

// ✅ UPLOAD IMAGE
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", verifyToken, upload.single("image"), userController.uploadProfileImage);

module.exports = router;
