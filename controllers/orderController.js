// controllers/orderController.js
const db = require("../config/db");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");


exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ GET DATA FROM REQUEST BODY
    const { full_name, address, city, phone } = req.body;

    // 🔥 GET EMAIL FROM DB
    const [users] = await db.query(
      "SELECT email FROM users WHERE id = ?",
      [userId]
    );

    const email = users[0].email;

    // 1. Get cart items
    const [cartItems] = await db.query(
      "SELECT c.*, p.name, p.price FROM carts c JOIN products p ON c.product_id = p.id WHERE c.user_id=?",
      [userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Calculate total
    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });

    const reference = uuidv4();

    // 3. Create order
    const [orderResult] = await db.query(
      `INSERT INTO orders (user_id, full_name, address, city, phone, total_amount, reference, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, full_name, address, city, phone, total, reference, "pending"]
    );

    const orderId = orderResult.insertId;

    // 4. INSERT INTO order_items ✅ THIS IS WHAT YOU ARE MISSING
    for (let item of cartItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // 5. Initialize Paystack
    const payment = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email, // ✅ FIXED
        amount: total * 100,
        reference,
      },
      {
        headers: {
          Authorization: `Bearer sk_test_a8ad6ce6eeb78078bb606f51382baa5a525988fb`,
        },
      }
    );

    // 6. Clear cart
    await db.query("DELETE FROM carts WHERE user_id = ?", [userId]);

    res.json({
      payment_url: payment.data.data.authorization_url,
      reference,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer sk_test_a8ad6ce6eeb78078bb606f51382baa5a525988fb`,
        },
      }
    );

    const data = response.data.data;

    if (data.status === "success") {
      await db.query(
        `UPDATE orders SET status = 'paid' WHERE reference = ?`,
        [reference]
      );

      return res.json({ message: "Payment verified" });
    }

    res.status(400).json({ message: "Payment not successful" });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.getOrders = (req, res) => {
  const userId = req.user.id;

  Order.getByUserId(userId, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders ORDER BY id DESC");

    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      order.items = items; // 🔥 attach items
    }

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};
// exports.getAllOrders = async (req, res) => {
//   try {
//     const [orders] = await db.query("SELECT * FROM orders");
//     res.json({ success: true, orders });
//   } catch (error) {
//     console.error("GET ALL ORDERS ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Optional validation
    const allowedStatuses = ["pending", "paid", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await db.query(
      "UPDATE orders SET status=? WHERE id=?",
      [status, id]
    );

    res.json({ success: true, message: "Order status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    const [order] = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );

    const [items] = await db.query(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      order: order[0],
      items,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
