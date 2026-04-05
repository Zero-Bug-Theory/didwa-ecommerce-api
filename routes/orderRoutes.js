const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");

// Create order
router.post("/", verifyToken, orderController.createOrder);

// Get user orders
// router.get("/orders/users", verifyToken, orderController.getOrders);

router.get("/orders/me", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Get orders
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );

    // 2. Attach items to each order
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      order.items = items;
    }

    // 3. Return
    res.json({ orders });

  } catch (err) {
    console.error("USER ORDERS ERROR:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
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
