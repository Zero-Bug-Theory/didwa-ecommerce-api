const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

router.get("/admin/stats", verifyToken, adminController.getDashboardStats);

module.exports = router;