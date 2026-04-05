const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");

// Create order
router.post("/", verifyToken, orderController.createOrder);

// Get user orders
// router.get("/orders/users", verifyToken, orderController.getOrders);

router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query("SELECT * FROM orders WHERE user_id = ?", [userId]);
    res.json({ orders: rows });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.toString() });
  }
});

router.put("/status/:id", verifyToken, orderController.updateOrderStatus);

// Get all orders (admin)
router.get("/all", verifyToken, orderController.getAllOrders);

router.post("/create", verifyToken, orderController.createOrder);
router.get("/verify/:reference", orderController.verifyPayment);

router.put("/orders/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;

  await db.query("UPDATE orders SET status=? WHERE id=?", [status, req.params.id]);

  res.json({ message: "Order updated" });
});

module.exports = router;
