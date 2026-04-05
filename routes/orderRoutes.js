const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");
const db = require("../config/db");

// Create order
router.post("/", verifyToken, orderController.createOrder);

// Get user orders
router.get("/", verifyToken, orderController.getOrders);

// Update status
router.put("/status/:id", verifyToken, orderController.updateOrderStatus);

// Get all orders (admin)
router.get("/all", verifyToken, orderController.getAllOrders);

// Verify payment
router.get("/verify/:reference", orderController.verifyPayment);

// Manual update
router.put("/orders/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;

  await db.query("UPDATE orders SET status=? WHERE id=?", [status, req.params.id]);

  res.json({ message: "Order updated" });
});

module.exports = router;
