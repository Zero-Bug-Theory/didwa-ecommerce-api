const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const verifyToken = require("../middleware/authMiddleware");

// Protected routes
router.get("/", verifyToken, cartController.getCart);
router.post("/", verifyToken, cartController.addToCart);
router.delete("/:id", verifyToken, cartController.removeFromCart);
router.put("/:id", verifyToken, cartController.updateQuantity);

module.exports = router;